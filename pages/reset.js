import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';

const Reset = ({ siteName, logo, color }) => {
    const [email, setEmail] = useState();
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
        if (email) {
            tst("Mail sent successfully", "success");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            setEmail("");
        } else {
            tst("Please fill all the fields", "error");
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        if (e.target.name === "email")
            setEmail(e.target.value);
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
                <title>Reset Password | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw", background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                <form onSubmit={handleSubmit} method="POST" className='pt-3 px-5 pb-5'>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase">Reset Password</h5>
                    <div className="mb-3">
                        <label htmlFor="email">Email address</label>
                        <input type="email" className="form-control" value={email} onChange={handleChange} name="email" id="email" placeholder="name@example.com" />
                    </div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-2">Reset Now</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}
                    <div className="d-flex justify-content-end align-items-center mt-3">
                        <Link href={"/login"}><a className='link'>Back to Login ?</a></Link>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Reset