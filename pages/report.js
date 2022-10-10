import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { getDocs, query, where, collection } from "firebase/firestore";
import Loader from '../Components/Loader';

const Report = ({ siteName, color, user }) => {
    const router = useRouter();
    const [suggestions, setSuggestions] = useState();
    const [detect, setDetect] = useState();
    useEffect(() => {
        if (!localStorage.getItem("ira-user")) {
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        const getData = async () => {
            let sugg = [];
            const querySnapshot = await getDocs(collection(db, `suggestions`));
            querySnapshot.forEach((doc) => {
                sugg.push(doc.data());
            });
            setSuggestions(sugg);
            const u = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            if (u.docs.length) {
                setDetect(u.docs[0].data().detect);
            }
        }
        getData();
    }, []);
    return (
        <>
            <Head>
                <title>Report | {siteName}</title>
            </Head>
            <section className="container pt-5 mt-5" style={{ height: "80vh" }}>
                <h1 className="display-5 text-center fw-bold text-uppercase mb-4">Report</h1>
                {(detect && suggestions) ? <table class="table table-responsive text-center">
                    <thead>
                        <tr>
                            <th scope="col">S.No.</th>
                            <th scope="col">Name</th>
                            <th scope="col">Test Number</th>
                            <th scope="col">Score</th>
                            <th scope="col">Suggestion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((val, index) => {
                            return <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td className='text-capitalize'>{user.name}</td>
                                <td>{val.detect}</td>
                                <td>{val.score}</td>
                                <td className='text-capitalize'>{val.suggestion}</td>
                            </tr>
                        })}
                    </tbody>
                </table> : <div className='d-flex justify-content-center align-items-center'>
                    <Loader color={color} />
                </div>}
            </section>
        </>
    )
}

export default Report