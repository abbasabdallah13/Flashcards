import {React, useState, useEffect, useCallback} from "react";
import FlashCard from "../../components/FlashCard";
import { useRouter } from "next/router";
import { client } from "../../libs/client";
import { AiFillCamera, AiOutlineConsoleSql } from 'react-icons/ai';

  
const Set = () => {
  const router = useRouter();
  const { setName } = router.query;


  const [flashCards, setFlashCards] = useState([]);
  const [allowNewFlashcard, setAllowNewFlashcard] = useState(true);
  const [oldFlashcards, setOldFlashcards] = useState([]);
  const [newCardId, setNewCardId] = useState(null);
  

  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [frontImgs, setFrontImgs] = useState([]);
  const [backImgs, setBackImgs] = useState([]);

  const [cardAltered, setCardAltered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updated, setUpdated] = useState(false);

  const [allSets, setAllSets] = useState([]);

  const [currentSetId, setCurrentSetId] = useState('');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);


  const [oldFrontText, setOldFrontText] = useState(oldFlashcards?.frontText);
  const [oldBackText, setOldBackText] = useState(oldFlashcards?.backText);
  const [oldFrontImgs, setOldFrontImgs] = useState(oldFlashcards?.frontImgs);
  const [oldBackImgs, setOldBackImgs] = useState(oldFlashcards?.backImgs);

  
  useEffect(() => {
    const getFlashcards = () => {
      const query = `*[_type == 'flashcards' && setName == '${setName}'] | order(_createdAt asc)  {
        _id,
        _createdAt,
        frontText,
        backText,
        frontImgs,
        backImgs,
        setName->{setName}
      }`;
  
      client.fetch(query).then(data => {setOldFlashcards(data); console.log(data)}).catch(err => console.log(err.message));

    }   

    getFlashcards();
    
  }, []);

  const removeImg = useCallback((cardFace, img) => {
    if(cardFace === 'front'){
        setFrontImgs((frontImgs) => frontImgs.filter(el => el !== img))
    }else if(cardFace === 'back'){
        setBackImgs((backImgs) => backImgs.filter(el => el !== img))
    }else if(cardFace === 'frontOld'){
        setCardAltered(true);
        setUpdated(false);
        setOldFrontImgs((oldFrontImgs) => oldFrontImgs.filter(el => el !== img))
    }else if(cardFace === 'backOld'){
        setCardAltered(true);
        setUpdated(false);
        setOldBackImgs((oldBackImgs) => oldBackImgs.filter(el => el !== img))
    }
},[frontImgs, backImgs]);

const addImgs = useCallback((cardFace,img) => {
    if(cardFace === 'front'){
        setFrontImgs((frontImgs) => [...frontImgs,img])
    }else if (cardFace === 'back'){
        setBackImgs((backImgs) => [...backImgs, img])
    }else if(cardFace === 'frontOld'){
        setOldFrontImgs((oldFrontImgs) => [...oldFrontImgs, img])
    }else if(cardFace === 'backOld'){
        setOldBackImgs((oldBackImgs) => [...oldBackImgs,img])
    }
}, [frontImgs, backImgs]);

const addPics = (e,flashcard_face) => {
        setCardAltered(true);
        const imgs = e.target.files;
        const imgsArray = Array.from(imgs);
        imgsArray?.map((img,i) => {
            if(img.type === 'image/png' || img.type === 'image/svg' || img.type === 'image/jpeg' || img.type === 'image/gif' || img.type === 'image/tiff'){
                    client
                    .assets.upload('image',img,{contentType:img.type, filename:img.name})
                    .then(document => {
                         if(flashcard_face === 'front'){
                             addImgs('front',document);
                         }else if(flashcard_face === 'back'){
                            addImgs('back',document);
                        }else if(flashcard_face === 'frontOld'){
                            addImgs('frontOld', document);
                        }else if(flashcard_face === 'backOld'){
                            addImgs('backOld', document)
                        }
                    })
                    .catch(err => console.log('upload failed' + err.message));
             }
       
        })        
}

const createFlashcard = () => {
    setSaved(true);
    setCardAltered(false);
    setAllowNewFlashcard(true);
    const doc = {
        _type: 'flashcards',
        frontText: frontText,
        backText: backText,
        frontImgs: frontImgs?.map(el => el.url),
        backImgs: backImgs?.map(el => el.url),
        setName: {
         _type: 'reference',
         _ref: currentSetId    
        }
    }

    client.create(doc).then((doc)=>{console.log(doc); newCardIdFunc(doc._id)});
}

const newCardIdFunc = useCallback((id) => {
  setNewCardId(id);
}, [newCardId]);

const updateNewFlashcard = (id) => {
    setAllowNewFlashcard(true);
    setCardAltered(false);
    setUpdated(true);
    setSaved(false);
    client.patch(id)
    .set({
        frontText: frontText,
        backText: backText,
        frontImgs: frontImgs?.map(el => el.url),
        backImgs: backImgs?.map(el => el.url),
    })
    .commit()
    .then(data => console.log(data))
    .catch(err => console.log(err.message))
}

const updateOldFlashcard = (id) => {
    setCardAltered(false);
    setUpdated(true);
    setSaved(false);
    client.patch(id)
    .set({
        frontText: oldFrontText,
        backText: oldBackText,
        frontImgs: oldFrontImgs?.map(el => typeof(el)==='object'?el?.url:el),
        backImgs: oldBackImgs?.map(el => typeof(el)==='object'?el?.url:el),
    })
    .commit()
    .then(data => console.log(data))
    .catch(err => console.log(err.message))
}



const deleteFlashcard = (e,id,front,newCard) => {
    if(newCard === 'new'){
        deleteNewFlashcard();
    }else{
        setOldFlashcards((oldFlashcards)=> oldFlashcards.filter(el => el._id !== id));
        client.delete({query: `*[_type == 'flashcards' && _id == '${id}']`})
        .then(()=>{console.log('card deleted')})
        .catch(err => console.log(err.message));
    }
    
}

const deleteNewFlashcard = useCallback(() => {
    setFlashCards([]);
    setAllowNewFlashcard(true);
    setCurrentSetId(null);
}, [flashCards]);
  

  return (
    <div className="flex flex-col items-center justify-center ">
      <div>{setName}</div>
      {
        oldFlashcards && oldFlashcards.map(el => (
          <>
          <div className='w-full flex flex-col p-4 bg-[#ffd770] items-center mt-4 relative'>
              {confirmDeleteModal && (
                  <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80  flex items-center justify-center flex-col">
                     <h3 className="text-white">Are you sure you want to delete flashcard ?</h3>
                     <div className="text-white flex gap-2">
                          <button className="border-2 px-2 py-1" onClick={(e)=>deleteFlashcard(e,oldFlashcards._id,oldFlashcards.frontText)}>Yes</button>
                          <button onClick={()=> setConfirmDeleteModal(false)}>Cancel</button>
                     </div>
                    
                  </div>
              )}
              <div id='deleteFlashcard' className="cursor-pointer"  onClick={()=> setConfirmDeleteModal(true)}  >X</div>
              <div className="flex justify-around w-full">
                  <div className='flashcard front'>
                      <label>Flashcard Front</label>
                      <div className="flex items-center">
                          <input className="w-full" value={oldFrontText}   placeholder="Add Definition.." type='text' onChange={(e)=>{setOldFrontText(e.target.value); setCardAltered(true); setUpdated(false)}} />
                          <div className="relative w-[2vw] h-[2vw] c-pointer right-[2vw]">
                              <AiFillCamera size='1.4rem' className="cursor-pointer"  />
                              <input type='file' className="c-pointer opacity-0 absolute top-0 left-0 w-full h-full" multiple onChange={(e)=>addPics(e,'frontOld')} />
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                          {oldFrontImgs?.length !==0 && oldFrontImgs?.map(el => (
                            <div className="relative">
                                <p className="absolute top-[-0.49vw] right-[-0.2vw] cursor-pointer" onClick={()=>removeImg('frontOld', el)} >X</p>
                                <img key={el} className="w-10 h-10"  src={typeof(el) === 'object'?el?.url:el}  /> 
                                {/* src is like this because here the user might update the old flashcard and add images so I want to display both old and new images */}
                            </div>
                          ))}
                      </div>
                  </div>
              
                  <div className='flashcard back'>
                      <label>Flashcard Back</label>
                      <div className="flex items-center">
                          <input className="w-full" value={oldBackText}   placeholder="Add Definition.." type='text' onChange={(e)=>{setOldBackText(e.target.value); setCardAltered(true); setUpdated(false)}}  />
                          <div className="relative w-[2vw] h-[2vw] c-pointer right-[2vw]">
                              <AiFillCamera size='1.4rem' className="cursor-pointer"  />
                              <input type='file' className="c-pointer opacity-0 absolute top-0 left-0 w-full h-full" multiple onChange={(e)=>addPics(e,'backOld')}/>
                          </div>
                      </div> 
                      <div className="flex flex-wrap gap-2 pt-2">
                          {oldBackImgs?.length !==0 && oldBackImgs?.map(el => (
                          <div className="relative">
                               <p className="absolute top-0 right-0 text-3xl" onClick={()=>removeImg('backOld', el)}>X</p>
                               <img key={el} className="w-10 h-10" src={typeof(el) === 'object'?el?.url:el}  />
                            {/* src is like this because here the user might update the old flashcard and add images so I want to display both old and new images */}
                          </div>
                          ))}
                      
                      </div> 
                  </div>
              </div>
                  {cardAltered && !updated || cardAltered ? (<button onClick={()=>updateOldFlashcard(oldFlashcards._id)}  className="mt-6 border-2 border-black w-fit px-4 p-2 bg-white">Update card</button>):updated && !cardAltered ?(<p>Updated Old</p>):null}
           </div>
      </>
              ))
        
      }
      {oldFlashcards.length === 0 && 
        flashCards.length!==0 && flashCards.map(el => (
          <div className='w-full flex flex-col p-4 bg-[#ffd770] items-center mt-4 relative'>

          <div id='deleteFlashcard' onClick={(e)=>deleteNewFlashcard()}>X</div>

          <div className="flex justify-around w-full">
              <div className='flashcard front'>
                  <label>Flashcard Front</label>
                  <div className="flex items-center">
                      <input className="w-full"  placeholder="Add Definition.." type='text' onChange={(e)=>{setFrontText(e.target.value); setCardAltered(true); setAllowNewFlashcard(false); setUpdated(false)}} />
                      <div className="relative w-[2vw] h-[2vw] c-pointer right-[2vw]">
                          <AiFillCamera size='1.4rem' className="cursor-pointer"  />
                          <input type='file' className="c-pointer opacity-0 absolute top-0 left-0 w-full h-full" multiple onChange={(e)=>addPics(e,'front')} />
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {frontImgs?.length !==0 && frontImgs?.map(el => (
                        <div className="relative">
                            <p className="absolute top-0 right-0 cursor-pointer" onClick={()=>removeImg('front', el)}>X</p>
                            <img key={el._id} className="w-10 h-10"  src={el.url}  />
                        </div>
                    ))}
                </div>
               </div>
          
              <div className='flashcard back'>
                  <label>Flashcard Back</label>
                  <div className="flex items-center">
                      <input className="w-full" placeholder="Add Definition.." type='text' onChange={(e)=>{setBackText(e.target.value); setCardAltered(true); setAllowNewFlashcard(false)}}  />
                      <div className="relative w-[2vw] h-[2vw] c-pointer right-[2vw]">
                          <AiFillCamera size='1.4rem' className="cursor-pointer"  />
                          <input type='file' className="c-pointer opacity-0 absolute top-0 left-0 w-full h-full" multiple onChange={(e)=>addPics(e,'back')}/>
                      </div>
                  </div>  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {backImgs?.length !==0 && backImgs?.map(el => (
                        <div className="relative">
                            <p className="absolute top-0 right-0 cursor-pointer" onClick={()=>removeImg('back',el)}>X</p>
                            <img key={el._id} className="w-10 h-10"  src={el.url}  />
                        </div>
                    ))}
                </div> 
              </div>
          </div>

          {cardAltered && !saved && !newCardId|| cardAltered && !newCardId?(<button onClick={createFlashcard}  className="mt-6 border-2 border-black w-fit px-4 p-2 bg-white">Save card</button>):saved && !cardAltered?(<p>saved</p>):newCardId && cardAltered ?(<button className="border-2 border-black" onClick={()=>updateNewFlashcard(newCardId)}>Update</button>):updated?(<p>updated</p>):null}
  </div>
))
      }
      <button 
      className={`add-flashcard ${!allowNewFlashcard && 'dont-add-flashcard' }`}
      onClick={() => {allowNewFlashcard && setFlashCards([...flashCards,1]); setAllowNewFlashcard(false); setNewCardId(null) }}
      >
          Add Flashcard
      </button>  
    </div>
  )
};

export default Set;
