export const nodeAddresses = () => {
    let target = 3000;
    const nodes = [];
    while (target <= 3011) {
        if (target !== 3007)
            nodes.push(target.toString());
        target++;
    }
    return nodes;
};
export var Role;
(function (Role) {
    Role[Role["ADMIN"] = 0] = "ADMIN";
    Role[Role["NORMAL"] = 1] = "NORMAL";
})(Role || (Role = {}));
