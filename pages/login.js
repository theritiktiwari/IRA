import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head';
import { useRouter } from 'next/router';
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken';
import { db } from "../firebase";
import { getDocs, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';

const Login = ({ siteName, logo, color }) => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (localStorage.getItem("ira-user")) {
            router.push("/");
        }
    }, [router]);

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
        if (email && password) {
            const q = await getDocs(query(collection(db, "users"), where("email", "==", email)));
            if (q.docs.length) {
                let pass = CryptoJS.AES.decrypt(q.docs[0].data().password, process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY);
                let decryptedPassword = pass.toString(CryptoJS.enc.Utf8);
                if (password === decryptedPassword && q.docs[0].data().email === email) {
                    var token = jwt.sign({
                        data: {
                            name: q.docs[0].data().name,
                            email: q.docs[0].data().email
                        }
                    }, process.env.NEXT_PUBLIC_JWT_SECRET_KEY, {
                        expiresIn: "2d"
                    });
                    localStorage.setItem("ira-user", JSON.stringify({
                        token: token,
                        name: q.docs[0].data().name,
                        email: q.docs[0].data().email
                    }));
                    tst("Authetication successful", "success");
                    setTimeout(() => {
                        router.push('/');
                    }, 2500);
                } else {
                    tst("Invalid Credentials", "error");
                }
            } else {
                tst("Invalid Credentials", "error");
            }
            setEmail("");
            setPassword("");
        } else {
            tst("Please fill all the fields", "error");
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        if (e.target.name === "email")
            setEmail(e.target.value);
        else if (e.target.name === "password")
            setPassword(e.target.value);
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
                <title>Login | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                <form onSubmit={handleSubmit} method="POST" className='p-5 w-50'>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase">Login</h5>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" value={email} onChange={handleChange} name="email" id="email" placeholder="user@ira.com" />
                        <label htmlFor="email">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" value={password} onChange={handleChange} name="password" id="password" placeholder="Password" />
                        <label htmlFor="password">Password</label>
                    </div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-2">Login</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <Link href={"/reset"}><a className="link">Forget password ?</a></Link>
                        <Link href={"/signup"}><a className='link'>New User ?</a></Link>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Login