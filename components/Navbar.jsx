import React from "react";
import Link from "next/link";

const Navbar = () => {
    const navlinks = [ 
        {
            name:'Sets',
            link:'/'
        }
    ]
  return <div>
    <ul className="p-2">
    {   
        navlinks.map((el,i) => (
            <li key={el+i}  className="inline hover:text-blue-600"><Link href={el.link}>{el.name+' '}</Link></li>
        ))
    }
    </ul>
  </div>;
};

export default Navbar;
