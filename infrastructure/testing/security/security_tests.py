#!/usr/bin/env python3
"""
Comprehensive Security Testing Suite for QuantumBallot Infrastructure
Implements financial-grade security testing and vulnerability assessment
"""

import json
import socket
import ssl
import subprocess
import sys
from datetime import datetime
from typing import Dict

import boto3
import nmap
import requests
from botocore.exceptions import ClientError

import docker
from kubernetes import client, config


class SecurityTestSuite:
    """Main security testing suite for QuantumBallot infrastructure"""

    def __init__(self, environment: str = "test"):
        self.environment = environment
        self.aws_session = boto3.Session()
        self.docker_client = docker.from_env()
        self.results = []

        try:
            config.load_incluster_config()
        except Exception:
            config.load_kube_config()

        self.k8s_v1 = client.CoreV1Api()
        self.k8s_apps_v1 = client.AppsV1Api()

    def run_all_tests(self) -> Dict:
        """Run all security tests and return comprehensive results"""
        print(
            f"Starting comprehensive security testing for {self.environment} environment"
        )

        test_results = {
            "environment": self.environment,
            "timestamp": datetime.utcnow().isoformat(),
            "tests": {},
        }

        test_results["tests"]["infrastructure"] = self.test_infrastructure_security()
        test_results["tests"]["containers"] = self.test_container_security()
        test_results["tests"]["network"] = self.test_network_security()
        test_results["tests"]["application"] = self.test_application_security()
        test_results["tests"]["compliance"] = self.test_compliance()
        test_results["tests"]["vulnerabilities"] = self.test_vulnerabilities()

        self.generate_security_report(test_results)
        return test_results

    def test_infrastructure_security(self) -> Dict:
        """Test AWS infrastructure security configurations"""
        print("Testing infrastructure security...")

        return {
            "vpc_security": self.test_vpc_security(),
            "iam_security": self.test_iam_security(),
            "encryption": self.test_encryption_at_rest(),
            "logging": self.test_audit_logging(),
            "backup": self.test_backup_security(),
        }

    def test_vpc_security(self) -> Dict:
        """Test VPC security configurations"""
        ec2 = self.aws_session.client("ec2")
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            vpcs = ec2.describe_vpcs()["Vpcs"]
            for vpc in vpcs:
                vpc_id = vpc["VpcId"]
                flow_logs = ec2.describe_flow_logs(
                    Filters=[{"Name": "resource-id", "Values": [vpc_id]}]
                )["FlowLogs"]

                if flow_logs:
                    results["passed"].append(f"VPC {vpc_id} has flow logs enabled")
                else:
                    results["failed"].append(f"VPC {vpc_id} missing flow logs")

            security_groups = ec2.describe_security_groups()["SecurityGroups"]
            for sg in security_groups:
                sg_id = sg["GroupId"]
                for rule in sg.get("IpPermissions", []):
                    for ip_range in rule.get("IpRanges", []):
                        if ip_range.get("CidrIp") == "0.0.0.0/0":
                            if rule.get("FromPort") == 22:
                                results["failed"].append(
                                    f"SG {sg_id} allows SSH from anywhere"
                                )
                            elif rule.get("FromPort") == 3389:
                                results["failed"].append(
                                    f"SG {sg_id} allows RDP from anywhere"
                                )
                            elif rule.get("FromPort") not in (80, 443, None):
                                results["warnings"].append(
                                    f"SG {sg_id} allows {rule.get('FromPort')} from anywhere"
                                )

            nacls = ec2.describe_network_acls()["NetworkAcls"]
            for nacl in nacls:
                if not nacl["IsDefault"]:
                    results["passed"].append(
                        f"Custom NACL {nacl['NetworkAclId']} configured"
                    )

        except ClientError as e:
            results["failed"].append(f"Error testing VPC security: {str(e)}")

        return results

    def test_iam_security(self) -> Dict:
        """Test IAM security configurations"""
        iam = self.aws_session.client("iam")
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            policies = iam.list_policies(Scope="Local")["Policies"]
            for policy in policies:
                policy_arn = policy["Arn"]
                policy_version = iam.get_policy_version(
                    PolicyArn=policy_arn, VersionId=policy["DefaultVersionId"]
                )
                policy_doc = policy_version["PolicyVersion"]["Document"]

                for statement in policy_doc.get("Statement", []):
                    if statement.get("Effect") == "Allow":
                        actions = statement.get("Action", [])
                        if isinstance(actions, str):
                            actions = [actions]

                        if "*" in actions:
                            results["failed"].append(
                                f"Policy {policy['PolicyName']} grants admin access"
                            )

                        dangerous_actions = ["iam:*", "sts:AssumeRole", "ec2:*"]
                        for action in actions:
                            if any(
                                dangerous in action for dangerous in dangerous_actions
                            ):
                                results["warnings"].append(
                                    f"Policy {policy['PolicyName']} has privileged action: {action}"
                                )

            users = iam.list_users()["Users"]
            for user in users:
                username = user["UserName"]
                mfa_devices = iam.list_mfa_devices(UserName=username)["MFADevices"]
                if not mfa_devices:
                    results["warnings"].append(
                        f"User {username} does not have MFA enabled"
                    )
                else:
                    results["passed"].append(f"User {username} has MFA enabled")

            try:
                password_policy = iam.get_account_password_policy()["PasswordPolicy"]
                if password_policy.get("MinimumPasswordLength", 0) < 12:
                    results["failed"].append(
                        "Password policy requires less than 12 characters"
                    )
                else:
                    results["passed"].append(
                        "Password policy meets length requirements"
                    )

                if not password_policy.get("RequireSymbols", False):
                    results["warnings"].append(
                        "Password policy does not require symbols"
                    )
            except ClientError:
                results["failed"].append("No password policy configured")

        except ClientError as e:
            results["failed"].append(f"Error testing IAM security: {str(e)}")

        return results

    def test_encryption_at_rest(self) -> Dict:
        """Test encryption at rest configurations"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            rds = self.aws_session.client("rds")
            db_instances = rds.describe_db_instances()["DBInstances"]

            for db in db_instances:
                db_id = db["DBInstanceIdentifier"]
                if db.get("StorageEncrypted", False):
                    results["passed"].append(f"RDS instance {db_id} is encrypted")
                else:
                    results["failed"].append(f"RDS instance {db_id} is not encrypted")

            s3 = self.aws_session.client("s3")
            buckets = s3.list_buckets()["Buckets"]

            for bucket in buckets:
                bucket_name = bucket["Name"]
                try:
                    s3.get_bucket_encryption(Bucket=bucket_name)
                    results["passed"].append(
                        f"S3 bucket {bucket_name} has encryption enabled"
                    )
                except ClientError:
                    results["failed"].append(
                        f"S3 bucket {bucket_name} does not have encryption enabled"
                    )

            ec2 = self.aws_session.client("ec2")
            volumes = ec2.describe_volumes()["Volumes"]

            for volume in volumes:
                volume_id = volume["VolumeId"]
                if volume.get("Encrypted", False):
                    results["passed"].append(f"EBS volume {volume_id} is encrypted")
                else:
                    results["failed"].append(f"EBS volume {volume_id} is not encrypted")

        except ClientError as e:
            results["failed"].append(f"Error testing encryption: {str(e)}")

        return results

    def test_audit_logging(self) -> Dict:
        """Test audit logging configurations"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            cloudtrail = self.aws_session.client("cloudtrail")
            trails = cloudtrail.describe_trails()["trailList"]

            if not trails:
                results["failed"].append("No CloudTrail trails configured")
            else:
                for trail in trails:
                    trail_name = trail["Name"]
                    status = cloudtrail.get_trail_status(Name=trail_name)
                    if status["IsLogging"]:
                        results["passed"].append(
                            f"CloudTrail {trail_name} is actively logging"
                        )
                    else:
                        results["failed"].append(
                            f"CloudTrail {trail_name} is not logging"
                        )

                    if trail.get("IncludeGlobalServiceEvents", False):
                        results["passed"].append(
                            f"CloudTrail {trail_name} includes global events"
                        )
                    else:
                        results["warnings"].append(
                            f"CloudTrail {trail_name} does not include global events"
                        )

            logs = self.aws_session.client("logs")
            log_groups = logs.describe_log_groups()["logGroups"]

            for log_group in log_groups:
                group_name = log_group["logGroupName"]
                retention = log_group.get("retentionInDays")
                if retention and retention >= 365:
                    results["passed"].append(
                        f"Log group {group_name} has adequate retention"
                    )
                else:
                    results["warnings"].append(
                        f"Log group {group_name} has insufficient retention"
                    )

        except ClientError as e:
            results["failed"].append(f"Error testing audit logging: {str(e)}")

        return results

    def test_backup_security(self) -> Dict:
        """Test backup security configurations"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            backup = self.aws_session.client("backup")
            backup_plans = backup.list_backup_plans()["BackupPlansList"]
            if not backup_plans:
                results["warnings"].append("No backup plans configured")
            else:
                for plan in backup_plans:
                    results["passed"].append(
                        f"Backup plan {plan['BackupPlanName']} configured"
                    )

            backup_vaults = backup.list_backup_vaults()["BackupVaultList"]
            for vault in backup_vaults:
                vault_name = vault["BackupVaultName"]
                if vault.get("EncryptionKeyArn"):
                    results["passed"].append(f"Backup vault {vault_name} is encrypted")
                else:
                    results["failed"].append(
                        f"Backup vault {vault_name} is not encrypted"
                    )

        except ClientError as e:
            results["failed"].append(f"Error testing backup security: {str(e)}")

        return results

    def test_container_security(self) -> Dict:
        """Test container security configurations"""
        print("Testing container security...")

        return {
            "image_security": self.test_image_security(),
            "runtime_security": self.test_runtime_security(),
            "kubernetes_security": self.test_kubernetes_security(),
        }

    def test_image_security(self) -> Dict:
        """Test Docker image security"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            images = self.docker_client.images.list()

            for image in images:
                image_name = image.tags[0] if image.tags else image.id[:12]
                img_config = image.attrs.get("Config", {})
                user = img_config.get("User", "root")

                if user in ("", "root", "0"):
                    results["warnings"].append(f"Image {image_name} may run as root")
                else:
                    results["passed"].append(
                        f"Image {image_name} runs as non-root user: {user}"
                    )

        except Exception as e:
            results["warnings"].append(f"Could not test image security: {str(e)}")

        return results

    def test_runtime_security(self) -> Dict:
        """Test container runtime security"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            containers = self.docker_client.containers.list()

            for container in containers:
                name = container.name
                attrs = container.attrs

                host_config = attrs.get("HostConfig", {})

                # Check privilege mode
                if host_config.get("Privileged", False):
                    results["failed"].append(
                        f"Container {name} is running in privileged mode"
                    )
                else:
                    results["passed"].append(
                        f"Container {name} is not running in privileged mode"
                    )

                # Check read-only root filesystem
                if host_config.get("ReadonlyRootfs", False):
                    results["passed"].append(
                        f"Container {name} has read-only root filesystem"
                    )
                else:
                    results["warnings"].append(
                        f"Container {name} does not have read-only root filesystem"
                    )

                # Check capability drops
                cap_drop = host_config.get("CapDrop", [])
                if "ALL" in cap_drop:
                    results["passed"].append(f"Container {name} drops all capabilities")
                else:
                    results["warnings"].append(
                        f"Container {name} does not drop all capabilities"
                    )

        except Exception as e:
            results["warnings"].append(f"Could not test runtime security: {str(e)}")

        return results

    def test_kubernetes_security(self) -> Dict:
        """Test Kubernetes security configurations"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            pods = self.k8s_v1.list_pod_for_all_namespaces()

            for pod in pods.items:
                pod_name = pod.metadata.name
                namespace = pod.metadata.namespace

                spec = pod.spec
                if spec.security_context:
                    if spec.security_context.run_as_non_root:
                        results["passed"].append(
                            f"Pod {namespace}/{pod_name} enforces non-root"
                        )
                    else:
                        results["warnings"].append(
                            f"Pod {namespace}/{pod_name} does not enforce non-root"
                        )
                else:
                    results["warnings"].append(
                        f"Pod {namespace}/{pod_name} has no security context"
                    )

                for container in spec.containers:
                    container_name = container.name
                    if container.security_context:
                        if (
                            container.security_context.allow_privilege_escalation
                            is False
                        ):
                            results["passed"].append(
                                f"Container {container_name} disallows privilege escalation"
                            )
                        else:
                            results["warnings"].append(
                                f"Container {container_name} may allow privilege escalation"
                            )
                    else:
                        results["warnings"].append(
                            f"Container {container_name} has no security context"
                        )

        except Exception as e:
            results["warnings"].append(f"Could not test Kubernetes security: {str(e)}")

        return results

    def test_network_security(self) -> Dict:
        """Test network security configurations"""
        print("Testing network security...")

        return {
            "port_scanning": self.test_port_scanning(),
            "ssl_tls": self.test_ssl_tls_configuration(),
            "firewall": self.test_firewall_rules(),
        }

    def test_port_scanning(self) -> Dict:
        """Test for unexpected open ports"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            nm = nmap.PortScanner()
            nm.scan("127.0.0.1", "1-65535", arguments="-T4 --open")

            expected_ports = {80, 443, 3000, 8080, 9090, 3001}
            open_ports = set()

            for host in nm.all_hosts():
                for proto in nm[host].all_protocols():
                    for port in nm[host][proto].keys():
                        if nm[host][proto][port]["state"] == "open":
                            open_ports.add(port)

            unexpected_ports = open_ports - expected_ports
            if unexpected_ports:
                results["warnings"].append(
                    f"Unexpected open ports: {sorted(unexpected_ports)}"
                )
            else:
                results["passed"].append("No unexpected open ports detected")

        except Exception as e:
            results["warnings"].append(f"Could not perform port scan: {str(e)}")

        return results

    def test_ssl_tls_configuration(self) -> Dict:
        """Test SSL/TLS configuration"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        endpoints = [("localhost", 443), ("localhost", 8080)]

        for host, port in endpoints:
            try:
                context = ssl.create_default_context()
                with socket.create_connection((host, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=host) as ssock:
                        tls_version = ssock.version()
                        cipher = ssock.cipher()

                        if tls_version in ("TLSv1.2", "TLSv1.3"):
                            results["passed"].append(
                                f"{host}:{port} uses secure TLS version: {tls_version}"
                            )
                        else:
                            results["failed"].append(
                                f"{host}:{port} uses insecure TLS version: {tls_version}"
                            )

                        if cipher and cipher[2] >= 128:
                            results["passed"].append(
                                f"{host}:{port} uses adequate cipher strength"
                            )
                        else:
                            results["failed"].append(
                                f"{host}:{port} uses weak cipher: {cipher}"
                            )

            except Exception as e:
                results["warnings"].append(
                    f"Could not test SSL/TLS for {host}:{port}: {str(e)}"
                )

        return results

    def test_firewall_rules(self) -> Dict:
        """Test firewall rules"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            ufw_result = subprocess.run(
                ["ufw", "status"],
                capture_output=True,
                text=True,
                timeout=10,
            )

            if ufw_result.returncode == 0:
                if "Status: active" in ufw_result.stdout:
                    results["passed"].append("UFW firewall is active")
                else:
                    results["warnings"].append("UFW firewall is not active")

        except (subprocess.TimeoutExpired, FileNotFoundError, PermissionError):
            results["warnings"].append("Could not check UFW status")

        except Exception as e:
            results["failed"].append(f"Error testing firewall: {str(e)}")

        return results

    def test_application_security(self) -> Dict:
        """Test application-level security"""
        print("Testing application security...")

        return {
            "web_security": self.test_web_security(),
            "api_security": self.test_api_security(),
            "authentication": self.test_authentication_security(),
        }

    def test_web_security(self) -> Dict:
        """Test web application security"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        endpoints = [
            "http://localhost:8080",
            "http://localhost:3000",
            "http://localhost:3001",
        ]

        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, timeout=10, allow_redirects=False)
                headers = response.headers

                security_headers = {
                    "X-Frame-Options": "SAMEORIGIN",
                    "X-Content-Type-Options": "nosniff",
                    "X-XSS-Protection": "1; mode=block",
                    "Strict-Transport-Security": None,
                    "Content-Security-Policy": None,
                }

                for header, expected_value in security_headers.items():
                    if header in headers:
                        if expected_value and headers[header] != expected_value:
                            results["warnings"].append(
                                f"{endpoint} has incorrect {header}: {headers[header]}"
                            )
                        else:
                            results["passed"].append(f"{endpoint} has {header} header")
                    else:
                        results["failed"].append(f"{endpoint} missing {header} header")

                if "Server" in headers:
                    server_header = headers["Server"]
                    if any(
                        server in server_header.lower()
                        for server in ("nginx", "apache", "iis")
                    ):
                        results["warnings"].append(
                            f"{endpoint} discloses server information: {server_header}"
                        )

                if endpoint.startswith("http://") and response.status_code not in (
                    301,
                    302,
                    307,
                    308,
                ):
                    results["warnings"].append(f"{endpoint} does not redirect to HTTPS")

            except requests.RequestException as e:
                results["warnings"].append(f"Could not test {endpoint}: {str(e)}")

        return results

    def test_api_security(self) -> Dict:
        """Test API security"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        api_endpoints = [
            "http://localhost:3000/api/health",
            "http://localhost:3000/api/status",
        ]

        for endpoint in api_endpoints:
            try:
                # Test rate limiting
                rate_limited = False
                for _ in range(20):
                    response = requests.get(endpoint, timeout=5)
                    if response.status_code == 429:
                        results["passed"].append(f"{endpoint} has rate limiting")
                        rate_limited = True
                        break

                if not rate_limited:
                    results["warnings"].append(f"{endpoint} may not have rate limiting")

                # Test for SQL injection patterns
                sql_payloads = ["'", "1' OR '1'='1", "'; DROP TABLE users; --"]
                for payload in sql_payloads:
                    try:
                        resp = requests.get(f"{endpoint}?id={payload}", timeout=5)
                        error_patterns = (
                            "sql",
                            "mysql",
                            "postgresql",
                            "oracle",
                            "syntax error",
                        )
                        if any(p in resp.text.lower() for p in error_patterns):
                            results["failed"].append(
                                f"{endpoint} may be vulnerable to SQL injection"
                            )
                            break
                    except requests.RequestException:
                        pass
                else:
                    results["passed"].append(
                        f"{endpoint} appears protected against SQL injection"
                    )

                # Test for XSS patterns
                xss_payloads = [
                    "<script>alert('xss')</script>",
                    "javascript:alert('xss')",
                ]
                for payload in xss_payloads:
                    try:
                        resp = requests.get(f"{endpoint}?q={payload}", timeout=5)
                        if payload in resp.text:
                            results["failed"].append(
                                f"{endpoint} may be vulnerable to XSS"
                            )
                            break
                    except requests.RequestException:
                        pass
                else:
                    results["passed"].append(
                        f"{endpoint} appears protected against XSS"
                    )

            except requests.RequestException as e:
                results["warnings"].append(f"Could not test {endpoint}: {str(e)}")

        return results

    def test_authentication_security(self) -> Dict:
        """Test authentication security"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["warnings"].append("Authentication security tests need implementation")
        return results

    def test_compliance(self) -> Dict:
        """Test compliance requirements"""
        print("Testing compliance...")

        return {
            "data_protection": self.test_data_protection(),
            "audit_requirements": self.test_audit_requirements(),
            "retention_policies": self.test_retention_policies(),
        }

    def test_data_protection(self) -> Dict:
        """Test data protection compliance"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["passed"].append("Encryption tests covered in infrastructure security")
        results["warnings"].append(
            "Data classification compliance needs manual verification"
        )
        results["warnings"].append(
            "Access control compliance needs manual verification"
        )
        return results

    def test_audit_requirements(self) -> Dict:
        """Test audit requirements compliance"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["passed"].append(
            "Audit logging tests covered in infrastructure security"
        )
        results["warnings"].append("Audit trail integrity needs manual verification")
        return results

    def test_retention_policies(self) -> Dict:
        """Test data retention policies"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["passed"].append(
            "Log retention tests covered in infrastructure security"
        )
        results["warnings"].append("Backup retention policies need manual verification")
        return results

    def test_vulnerabilities(self) -> Dict:
        """Test for known vulnerabilities"""
        print("Testing for vulnerabilities...")

        return {
            "dependency_scanning": self.test_dependency_vulnerabilities(),
            "infrastructure_scanning": self.test_infrastructure_vulnerabilities(),
            "configuration_scanning": self.test_configuration_vulnerabilities(),
        }

    def test_dependency_vulnerabilities(self) -> Dict:
        """Test for dependency vulnerabilities"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}

        try:
            npm_audit = subprocess.run(
                ["npm", "audit", "--json"],
                capture_output=True,
                text=True,
                timeout=120,
                cwd="../../",
            )

            if npm_audit.returncode in (0, 1):
                audit_data = json.loads(npm_audit.stdout)
                vulnerabilities = audit_data.get("vulnerabilities", {})

                high_vulns = sum(
                    1 for v in vulnerabilities.values() if v.get("severity") == "high"
                )
                critical_vulns = sum(
                    1
                    for v in vulnerabilities.values()
                    if v.get("severity") == "critical"
                )

                if critical_vulns > 0:
                    results["failed"].append(
                        f"Found {critical_vulns} critical npm vulnerabilities"
                    )
                elif high_vulns > 0:
                    results["warnings"].append(
                        f"Found {high_vulns} high npm vulnerabilities"
                    )
                else:
                    results["passed"].append(
                        "No high/critical npm vulnerabilities found"
                    )

        except (
            subprocess.TimeoutExpired,
            FileNotFoundError,
            json.JSONDecodeError,
        ) as e:
            results["warnings"].append(f"Could not run npm audit: {str(e)}")

        return results

    def test_infrastructure_vulnerabilities(self) -> Dict:
        """Test infrastructure for vulnerabilities"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["warnings"].append(
            "Infrastructure vulnerability scanning needs integration with security tools"
        )
        return results

    def test_configuration_vulnerabilities(self) -> Dict:
        """Test configuration for vulnerabilities"""
        results: Dict = {"passed": [], "failed": [], "warnings": []}
        results["warnings"].append(
            "Configuration vulnerability scanning needs implementation"
        )
        return results

    def generate_security_report(self, test_results: Dict) -> None:
        """Generate comprehensive security report"""
        report_file = (
            f"security_report_{self.environment}_"
            f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        )

        with open(report_file, "w") as f:
            json.dump(test_results, f, indent=2)

        print(f"Security report generated: {report_file}")

        total_passed = 0
        total_failed = 0
        total_warnings = 0

        def count_results(results: Dict) -> None:
            nonlocal total_passed, total_failed, total_warnings
            if isinstance(results, dict):
                total_passed += len(results.get("passed", []))
                total_failed += len(results.get("failed", []))
                total_warnings += len(results.get("warnings", []))
                for value in results.values():
                    if isinstance(value, dict):
                        count_results(value)

        count_results(test_results["tests"])

        print(f"\nSecurity Test Summary:")
        print(f"Passed:   {total_passed}")
        print(f"Failed:   {total_failed}")
        print(f"Warnings: {total_warnings}")

        if total_failed > 0:
            print(f"\n❌ Security tests FAILED — {total_failed} critical issues found")
            sys.exit(1)
        elif total_warnings > 0:
            print(
                f"\n⚠️  Security tests PASSED with warnings — {total_warnings} items to review"
            )
        else:
            print("\n✅ All security tests PASSED")


def main():
    """Main function to run security tests"""
    import argparse

    parser = argparse.ArgumentParser(description="QuantumBallot Security Test Suite")
    parser.add_argument("--environment", default="test", help="Environment to test")
    parser.add_argument(
        "--test-type",
        choices=[
            "all",
            "infrastructure",
            "containers",
            "network",
            "application",
            "compliance",
            "vulnerabilities",
        ],
        default="all",
        help="Type of tests to run",
    )

    args = parser.parse_args()
    suite = SecurityTestSuite(args.environment)

    if args.test_type == "all":
        suite.run_all_tests()
    else:
        test_method = getattr(suite, f"test_{args.test_type}_security", None)
        if not test_method:
            test_method = getattr(suite, f"test_{args.test_type}")
        results = {args.test_type: test_method()}
        suite.generate_security_report(
            {
                "tests": results,
                "environment": args.environment,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )


if __name__ == "__main__":
    main()
