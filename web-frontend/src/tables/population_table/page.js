import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import axios from 'axios';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
function TablePopulation({ toast }) {
    const [data, setData] = useState([]);
    const onLoadPopulationData = async () => {
        await axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/registers')
            .then(response => {
            const data = response.data;
            if (data) {
                const registers = data.registers;
                if (registers) {
                    let newData = registers.map((element) => ({
                        name: element.name,
                        operation: '',
                        electoralId: element.electoralId,
                        email: element.email,
                        address: element.address,
                        province: element.province,
                        password: element.password,
                        status: element.status,
                        verification: element.verification,
                        otp: element.otp,
                        toast: toast,
                        setData: setData
                    }));
                    newData.sort((a, b) => {
                        const nameA = a.name.toLowerCase();
                        const nameB = b.name.toLowerCase();
                        if (nameA < nameB)
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0;
                    });
                    newData = newData.map((element, index) => ({
                        id: index + 1,
                        ...element
                    }));
                    setData([...newData]);
                }
            }
        })
            .catch(error => console.error(error));
    };
    useEffect(() => {
        onLoadPopulationData();
    }, []);
    return (_jsxs("section", { children: [_jsx(Button, { className: "max-w-lg", onClick: onLoadPopulationData, children: "Load / Refresh Data" }), _jsx(DataTable, { columns: columns, data: data })] }));
}
export default TablePopulation;
