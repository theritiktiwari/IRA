import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const About = ({ siteName, color }) => {
    const [text, setText] = useState('');
    useEffect(() => {
        const getData = async () => {
            const q = await getDoc(doc(db, "about", "aboutText"));
            setText(q.data().detail);
        }
        getData();
    }, []);
    return (
        <>
            <section className='about my-5 mx-auto'>
                <div className="d-flex justify-content-center">
                    <div className="p-5 text-center bg">
                        <h3 className="mb-4 font-bold text-uppercase">About <span className='name'>{siteName}</span></h3>
                        {text ? <p>{text}</p> : <Loader color={color} />}
                    </div>
                </div>
            </section>
        </>
    )
}

export default About