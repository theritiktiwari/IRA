import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { doc, addDoc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';

const BuildProfile = ({ siteName, logo, color, user }) => {
    const router = useRouter();
    const [questions, setQuestions] = useState();
    const [answer, setAnswer] = useState();
    const [order, setOrder] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("ira-user")) {
            router.push("/");
        }
        const check = async () => {
            const q = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            if (q.docs.length) {
                if (q.docs[0].data().profile == true) {
                    router.push("/");
                }
            }
        }
        check();
    }, [router, user]);

    useEffect(() => {
        setOrder(JSON.parse(localStorage.getItem("ira-order")) || 0);
        const getData = async () => {
            let q = [];
            const querySnapshot = await getDocs(collection(db, "profile-questions"));
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
                q.push(doc.data());
            });
            setQuestions(q);
        }
        getData();
    }, []);

    const tst = (msg, type) => {
        const data = {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        }
        if (type == "success") {
            toast.success(`${msg}`, data);
        } else {
            toast.error(`${msg}`, data);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (answer) {
            let query = await addDoc(collection(db, "profile-answers"), {
                question: questions[order].question,
                answer: answer,
                user_id: user.id
            });
            if (query.id) {
                tst("Answer submitted successfully", "success");
                localStorage.setItem("ira-order", JSON.stringify(order + 1));
                setOrder(order + 1);
                setAnswer("");
                if (order == questions.length - 1) {
                    await updateDoc(doc(db, "users", user.id), {
                        profile: true,
                        mood: "sad"
                    });
                    localStorage.removeItem("ira-order");
                    router.push('/');
                }
            } else {
                tst("Something went wrong", "error");
            }
        } else {
            tst("Please answer the question", "error");
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        if (e.target.name === "answer")
            setAnswer(e.target.value);
    }
    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Head>
                <title>Profile Building | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                {questions && questions.length > 0 && order < questions.length ? <form onSubmit={handleSubmit} method="POST" className='p-5 w-50'>
                    {/* {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null} */}
                    <h5 className="mb-4 text-uppercase">{questions[order].question}</h5>
                    <div className=" mb-3">
                        <label htmlFor="answer" className='form-label'>Answer</label>
                        <textarea className="form-control" placeholder="Enter your answer here" name="answer" value={answer} onChange={handleChange} id="answer" style={{ height: "100px" }}></textarea>
                    </div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-2">{(order === questions.length - 1) ? "Submit" : "Next"}</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}
                </form> : <Loader color={color} />}
            </section>
        </>
    )
}

export default BuildProfile;