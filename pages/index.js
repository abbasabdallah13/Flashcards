import {React, useState, useEffect} from "react";
import { useRouter } from 'next/router';
import { client } from "../libs/client";
import { BsPlusCircle } from 'react-icons/bs';

const Sets = () => {

  const router = useRouter();

  const [sets, setSets] = useState([]);
  const [setSelected, setSetSelected] = useState('');
  const [addSetModal, setAddSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');

  const addSet = () => {
    const doc = {
      _type: 'sets',
      setName: newSetName
    }

    client.create(doc).then(data => window.location.reload()).catch(err => console.log(err));
  }

  useEffect(() => {
    setSelected && router.push(`/Set/${setSelected}`);
  }, [setSelected]);  

  useEffect(() => {
    const query = `*[_type == 'sets']`;

    client.fetch(query).then(data => {setSets(data); console.log(data)}).catch(err => console.log('Fetch failed'+err.message))
  }, []);
  

  return <div>
    <div className="flex">
      <select className="p-2 border-black border-2"  value={setSelected} onChange={(e) => setSetSelected(e.target.value)}>
        <option>Select Set ...</option>
        {
          sets.map(el => (
            <option key={el._id} value={el.setName}>{el.setName}</option>
          ))
        }
      </select>
      <button onClick={() => setAddSetModal(true)}><BsPlusCircle /></button>
    </div>
    {addSetModal && (
      <div>
        <input className="border-2 border-black"  type='text' onChange={(e) => setNewSetName(e.target.value)} />
        <button className="border-2 border-black"  onClick={addSet}>Save</button>
      </div>
    )}
  </div>;
};

export default Sets;
