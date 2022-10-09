import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const About = ({ siteName }) => {
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
            {text ? <section className='about my-5 mx-auto'>
                <div className="d-flex justify-content-center">
                    <div className="p-5 text-center bg">
                        <h3 className="mb-4 font-bold text-uppercase">About <span className='name'>{siteName}</span></h3>
                        <p>{text}</p>
                    </div>
                </div>
            </section> : null}
        </>
    )
}

export default About