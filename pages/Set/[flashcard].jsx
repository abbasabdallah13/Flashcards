import {React, useEffect, useState, useCallback} from "react";
import { useRouter } from "next/router";
import { client } from "../../libs/client";

const flashcard = () => {
    const router = useRouter();
    const setName = router.query.flashcard;
    console.log(router);
    
    
    useEffect(() => {
        const query = `*[_type == "sets" && setName == "${setName}"]{
            setName,
            _id
        }`;
        client.fetch(query).then(data =>{setSet(data);console.log(data)} )
         .catch(err => console.log(err.message));
         
    }, []);     
    

  return <div>Hello{setName}</div>;
};

export default flashcard;
