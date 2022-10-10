import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head';
import CryptoJS from "crypto-js";
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { addDoc, getDocs, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';

const Signup = ({ siteName, logo, color }) => {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
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
        if (name && email && password && confirmPassword) {
            const q = await getDocs(query(collection(db, "users"), where("email", "==", email)));
            if (q.docs.length) {
                tst("Email already exists", "error");
            } else if (password === confirmPassword) {
                let query = await addDoc(collection(db, "users"), {
                    name: name,
                    email: email,
                    password: CryptoJS.AES.encrypt(password, process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY).toString(),
                    profile: false
                });
                if (query.id) {
                    tst("Account created successfully", "success");
                    setTimeout(() => {
                        router.push('/login');
                    }, 2500);
                } else {
                    tst("Something went wrong", "error");
                }
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                tst("Password does not match", "error");
            }
        } else {
            tst("Please fill all the fields", "error");
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        if (e.target.name === "name")
            setName(e.target.value);
        else if (e.target.name === "email")
            setEmail(e.target.value);
        else if (e.target.name === "password")
            setPassword(e.target.value);
        else if (e.target.name === "confirmPassword")
            setConfirmPassword(e.target.value);
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
                <title>Signup | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                <form onSubmit={handleSubmit} method="POST" className='p-5'>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase">Signup</h5>
                    <div className="form-floating mb-3">
                        <input type="name" className="form-control" name="name" value={name} onChange={handleChange} id="name" placeholder="Name" />
                        <label htmlFor="name">Name</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" name="email" value={email} onChange={handleChange} id="email" placeholder="user@ira.com" />
                        <label htmlFor="email">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" name="password" value={password} onChange={handleChange} id="password" placeholder="Password" />
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" name="confirmPassword" value={confirmPassword} onChange={handleChange} id="confirmPassword" placeholder="Confirm Password" />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-2">Signup</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}

                    <div className="d-flex justify-content-end align-items-center mt-3">
                        <Link href={"/login"}><a className='link'>Already an account ?</a></Link>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Signup