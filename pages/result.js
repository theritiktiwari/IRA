import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Loader from '../Components/Loader';

const Result = ({ siteName, logo, user, color }) => {
    const [data, setData] = useState({ data: 0, length: 0, detect: 0 });
    const [state, setState] = useState();
    const [suggestion, setSuggestion] = useState();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem("ira-user"))
            router.push("/");
    }, [router]);

    useEffect(() => {
        const d = JSON.parse(localStorage.getItem("ira-data"));
        if (d) {
            setData({ data: d.data, length: d.length, detect: d.detect })
            let moodData = count(d.data);
            let m = Object.keys(moodData).reduce((a, b) => moodData[a] > moodData[b] ? a : b);
            let moodPercentage = (moodData[m] / d.length) * 100;
            let mood = (m == 1) ? "Sad" : (m == 2) ? "Happy" : (m == 3) ? "Confused" : (m == 4) ? "LOL" : "";
            setState({ mood, moodPercentage });

            if (mood == "Sad")
                setSuggestion("talk to the therapist");
            else if (mood == "Happy")
                setSuggestion("listen some music");
            else if (mood == "Confused")
                setSuggestion("talk to friends");
            else if (mood == "LOL")
                setSuggestion("go on Trip");
        } else {
            router.push("/");
        }
    }, []);

    const count = (val) => {
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] == "1")
                count1++;
            else if (val[i] == "2")
                count2++;
            else if (val[i] == "3")
                count3++;
            else if (val[i] == "4")
                count4++;
        }
        return { 1: count1, 2: count2, 3: count3, 4: count4 };
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let query = await addDoc(collection(db, "suggestions"), {
            detect: data.detect,
            mood: state.mood,
            percentage: state.moodPercentage,
            suggestion: suggestion,
            user_id: user.id
        });
        if (query.id) {
            localStorage.removeItem("ira-data");
            router.push('/');
        }
        setLoading(false);
    }

    return (
        <>
            <Head>
                <title>Results | {siteName}</title>
            </Head>
            <section className="d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                {(data && suggestion) ? <form method="POST" className='p-5' onSubmit={handleSubmit}>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><img src={logo} alt="logo" className='mb-2' width="100" /></div> : null}
                    <h5 className="mb-4 text-uppercase text-center display-6 fw-bold">Results</h5>
                    <div className='text-center'>You are <span className='fw-bold'>{state.moodPercentage}% {state.mood}</span></div>
                    <div className='text-center'>We&apos;ll suggest you to <span className='fw-bold'>{suggestion}.</span></div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-3">Back to Home</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}
                </form> : <Loader color={color} />}
            </section>
        </>
    )
}

export default Result