import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export const AdminTicketsPage=()=>{
    const { setHeaderContent} =useOutletContext();
    useEffect(()=>{
       setHeaderContent({
         title: "Support Tickets",
         subtitle: "Review open tickets and assist users with their issues.",
       });
    },[])

    return (
        <>
        <h1>This is the admin Ticket page</h1>
        </>
    )
}