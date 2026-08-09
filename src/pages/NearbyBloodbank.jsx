import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";


export const BloodBankPage=()=>{
    const {setHeaderContent}=useOutletContext();

    useEffect(() => {
        setHeaderContent({
          title: "Nearby Blood Banks",
          subtitle: "Explore nearby blood banks and their available blood inventory",
          action: undefined,
        });
      }, [setHeaderContent]);

    return(
        <>
        <h1>Blood bank page</h1>
        </>
    )
}