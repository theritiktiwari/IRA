import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../../firebase";
import { doc, addDoc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../Components/Loader';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Text = ({ siteName, color, user }) => {
    const router = useRouter();
    const [questions, setQuestions] = useState();
    const [answer, setAnswer] = useState();
    const [order, setOrder] = useState();
    const [score, setScore] = useState("");
    const [detect, setDetect] = useState();
    const [totalQuestions, setTotalQuestions] = useState();
    const [personality, setPersonality] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("ira-user")) {
            router.push("/");
        }
        const check = async () => {
            const q = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            if (q.docs.length) {
                if (q.docs[0].data().profile == false) {
                    router.push("/buildProfile");
                }
            }
        }
        check();
    }, [router, user]);

    useEffect(() => {
        setOrder(JSON.parse(localStorage.getItem("ira-detect")) || 1);
        setScore(JSON.parse(localStorage.getItem("ira-score")) || "");
        const getData = async () => {
            const u = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            if (u.docs.length) {
                setPersonality(u.docs[0].data().personality);
                setDetect(u.docs[0].data().detect || 0);
                let q = [];
                const querySnapshot = await getDocs(collection(db, `${u.docs[0].data().personality}-questions-detection`));
                querySnapshot.forEach((doc) => {
                    q[doc.id] = doc.data();
                });
                setQuestions(q);
                setTotalQuestions(q.length);
            }
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
            let option = document.querySelector("#option1") && document.querySelector("#option1").checked ? "1" :
                document.querySelector("#option2") && document.querySelector("#option2").checked ? "2" :
                    document.querySelector("#option3") && document.querySelector("#option3").checked ? "3" :
                        document.querySelector("#option4") && document.querySelector("#option4").checked ? "4" : 0;

            if (order == 2 || order == 3) {
                option = 0;
            }

            let query = await addDoc(collection(db, "detection"), {
                question: questions[order].question,
                answer: answer,
                option: option,
                detect: detect + 1,
                user_id: user.id
            });
            if (query.id) {
                tst("Answer submitted successfully", "success");
                localStorage.setItem("ira-detect", JSON.stringify(order + 1));
                localStorage.setItem("ira-score", JSON.stringify("" + score + option));
                if (order == questions.length - 1) {
                    await updateDoc(doc(db, "users", user.id), {
                        detect: detect + 1,
                    });
                    localStorage.setItem("ira-data", JSON.stringify({
                        type: "text",
                        data: ("" + score + option),
                        length: questions.length,
                        detect: detect + 1,
                        personality: personality
                    }));
                    localStorage.removeItem("ira-score");
                    localStorage.removeItem("ira-detect");
                    router.push('/result');
                } else {
                    setAnswer("");
                    setScore("" + score + option);
                    setOrder(order + 1);
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
                <title>Mood Detection | {siteName}</title>
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
            <section className="d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw", background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                {questions && questions.length > 0 && order < questions.length ? <>
                    <form onSubmit={handleSubmit} method="POST" className='p-5'>
                        <h5 className="mb-4">{questions[order].question}</h5>
                        {questions[order].option1 && <div className="form-check w-100">
                            <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option1" value={questions[order].option1} />
                            <label className="form-check-label" htmlFor="option1">{questions[order].option1}</label>
                        </div>}
                        {questions[order].option3 && <div className="form-check w-100">
                            <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option2" value={questions[order].option2} />
                            <label className="form-check-label" htmlFor="option2">{questions[order].option2}</label>
                        </div>}
                        {questions[order].option3 && <div className="form-check w-100">
                            <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option3" value={questions[order].option3} />
                            <label className="form-check-label" htmlFor="option3">{questions[order].option3}</label>
                        </div>}
                        {questions[order].option4 && <div className="form-check w-100">
                            <input className="form-check-input" type="radio" name="option" onChange={handleChange} id="option4" value={questions[order].option4} />
                            <label className="form-check-label" htmlFor="option4">{questions[order].option4}</label>
                        </div>}
                        {!(questions[order].option1 || questions[order].option2 || questions[order].option3 || questions[order].option4) && <div className="mb-3">
                            {/* <label htmlFor="answer" className='form-label'>Answer</label> */}
                            <textarea className="form-control" placeholder="Enter your answer here" name="answer" value={answer} onChange={handleChange} id="answer" style={{ height: "100px" }}></textarea>
                        </div>}
                        {!loading && <button type="submit" className="btn-main w-100 mt-3">{(order === questions.length - 1) ? "Submit" : "Next"}</button>}
                        {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                            <Loader color={color} />
                        </div>}
                    </form>
                </> : <Loader color={color} />}
            </section>
        </>
    )
}

export default Text;