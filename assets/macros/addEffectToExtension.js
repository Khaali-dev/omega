main()

async function main(){
    let itemID="LSuVKZLTOKIsWDAc";
    let effect=[
        {
            name: "systemesauxiliaires_bonus",
            options: {
                reference: "blindage",
                value:2
            }
        }
    ]
    const item = game.items.get(itemID);
    if(!item){
        console.log("Can't find item with ID : ", itemID);
        return;
    }

    item.update({'system.effet': effect});
    console.log("fait pour : ", item.name);
}
