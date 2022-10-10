import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Loader from '../Components/Loader';

const Result = ({ siteName, logo, user, color }) => {
    const [data, setData] = useState({ score: 0, percentage: 0, length: 0, detect: 0 });
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
            setData({ score: d.score, percentage: d.percentage, length: d.length, detect: d.detect })
            if (d.percentage > 0 && d.percentage <= 25)
                setSuggestion("talk to the therapist");
            else if (d.percentage > 25 && d.percentage <= 50)
                setSuggestion("listen some music");
            else if (d.percentage > 50 && d.percentage <= 75)
                setSuggestion("talk to friends");
            else if (d.percentage > 75 && d.percentage <= 100)
                setSuggestion("go on Trip");

            suggestion && addSuggestion(d.detect, d.score);
        } else {
            router.push("/");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let query = await addDoc(collection(db, "suggestions"), {
            detect: data.detect,
            score: data.score,
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
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase text-center display-6 fw-bold">Results</h5>
                    <div className='text-center'>Your score is <span className='fw-bold'>{data.score}/{data.length * 4}</span></div>
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