import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { doc, addDoc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const BuildProfile = ({ siteName, logo, color, user }) => {
    const router = useRouter();
    const [questions, setQuestions] = useState();
    const [answer, setAnswer] = useState();
    const [order, setOrder] = useState(0);
    const [score, setScore] = useState();
    const [totalQuestions, setTotalQuestions] = useState();
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
        setOrder(JSON.parse(localStorage.getItem("ira-order")) || 1);
        setScore(localStorage.getItem("ira-score") || "");
        const getData = async () => {
            let q = [];
            const querySnapshot = await getDocs(collection(db, "profile-questions"));
            querySnapshot.forEach((doc) => {
                q[doc.id] = doc.data();
            });
            setQuestions(q);
            setTotalQuestions(q.length);
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
        if (answer) {
            let option = document.querySelector("#option1") && document.querySelector("#option1").checked ? "1" :
                document.querySelector("#option2") && document.querySelector("#option2").checked ? "2" :
                    document.querySelector("#option3") && document.querySelector("#option3").checked ? "3" :
                        document.querySelector("#option4") && document.querySelector("#option4").checked ? "4" : 0;

            if (order == 1 || order == 2 || order == 3 || order == 4 || order == 6 || order == 13 || order == 14) {
                option = 0;
            }

            const qq = await getDocs(query(collection(db, "profile-answers"), where("qid", "==", order), where("user_id", "==", user.id)));
            if (!qq.docs.length) {
                let query = await addDoc(collection(db, "profile-answers"), {
                    question: questions[order].question,
                    answer: answer,
                    qid: order,
                    user_id: user.id
                });
                if (query.id) {
                    tst("Answer submitted successfully", "success");
                    localStorage.setItem("ira-order", JSON.stringify(order + 1));
                    localStorage.setItem("ira-score", JSON.stringify("" + score + option));
                    if (order == questions.length - 1) {
                        let str = JSON.parse(localStorage.getItem("ira-score"));
                        let optionCount = count(str);
                        let max = Math.max(optionCount[1], optionCount[2], optionCount[3], optionCount[4]);
                        let personality = "";
                        if (max == optionCount[1])
                            personality = "adventurous";
                        else if (max == optionCount[2])
                            personality = "introvert";
                        else if (max == optionCount[3])
                            personality = "peacemaker";
                        else if (max == optionCount[4])
                            personality = "confident";

                        await updateDoc(doc(db, "users", user.id), {
                            profile: true,
                            personality: personality
                        });
                        localStorage.removeItem("ira-order");
                        localStorage.removeItem("ira-score");
                        router.push('/');
                    }
                    setOrder(order + 1);
                    setScore("" + score + option);
                    setAnswer("");
                } else {
                    tst("Something went wrong", "error");
                }
            } else {
                tst("You have already answered this question", "error");
                localStorage.setItem("ira-order", JSON.stringify(order + 1));
                setOrder(order + 1);
                if (order == questions.length - 1) {
                    const q = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
                    if (q.docs.length) {
                        if (q.docs[0].data().personality) {
                            await updateDoc(doc(db, "users", user.id), {
                                profile: true,
                            });
                            localStorage.removeItem("ira-order");
                            localStorage.removeItem("ira-score");
                            router.push('/');
                        }
                    }
                }
            }
        } else {
            tst("Please answer the question", "error");
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        if (e.target.name === "answer" || e.target.name === "option")
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
            <div className="progress-bar">
                <CircularProgressbar
                    value={(order == 1) ? 0 : (order / totalQuestions) * 100}
                    text={(order == 1) ? '0%' : `${Number(((order / totalQuestions) * 100).toFixed(1))}%`}
                    styles={buildStyles({
                        pathColor: "#FD365C",
                        textColor: "#FD365C",
                        trailColor: "#FFFFFF",
                    })}
                />
            </div>
            <section className="auth d-flex flex-column justify-content-center align-items-center pb-5" style={{ minHeight: "100vh", width: "100vw", background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                <h2 className="text-center my-5 text-light">Complete Your Profile</h2>
                {questions && questions.length > 0 && order < questions.length ? <form onSubmit={handleSubmit} method="POST" className='p-5 w-50'>
                    <h5 className="mb-4 text-uppercase" style={{ textAlign: "justify" }}>{questions[order].question}</h5>
                    {questions[order].option1 && <div className="form-check w-100">
                        <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option1" value={questions[order].option1} />
                        <label className="form-check-label text-capitalize" htmlFor="option1">{questions[order].option1}</label>
                    </div>}
                    {questions[order].option3 && <div className="form-check w-100">
                        <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option2" value={questions[order].option2} />
                        <label className="form-check-label text-capitalize" htmlFor="option2">{questions[order].option2}</label>
                    </div>}
                    {questions[order].option3 && <div className="form-check w-100">
                        <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option3" value={questions[order].option3} />
                        <label className="form-check-label text-capitalize" htmlFor="option3">{questions[order].option3}</label>
                    </div>}
                    {questions[order].option4 && <div className="form-check w-100">
                        <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option4" value={questions[order].option4} />
                        <label className="form-check-label text-capitalize" htmlFor="option4">{questions[order].option4}</label>
                    </div>}
                    {(order !== 1) && (!(questions[order].option1 || questions[order].option2 || questions[order].option3 || questions[order].option4)) && <div className="mb-3">
                        {/* <label htmlFor="answer" className='form-label'>Answer</label> */}
                        <textarea className="form-control" placeholder="Enter your answer here" name="answer" value={answer} onChange={handleChange} id="answer" style={{ height: "100px" }}></textarea>
                    </div>}
                    {(order == 1) && (!(questions[order].option1 || questions[order].option2 || questions[order].option3 || questions[order].option4)) && <div className="mb-3">
                        <input type="number" min="0" max="99" className="form-control" placeholder="Enter your answer here" name="answer" value={answer} onChange={handleChange} id="answer" />
                    </div>}
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