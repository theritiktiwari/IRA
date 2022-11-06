import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { doc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../Components/Loader';

const Profile = ({ siteName, user, color }) => {
    const router = useRouter();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [profileData, setProfileData] = useState();
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
        const getData = async () => {
            let q = [];
            const userDetails = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            userDetails && setName(userDetails.docs[0].data().name)
            userDetails && setEmail(userDetails.docs[0].data().email)
            const querySnapshot = await getDocs(query(collection(db, "profile-answers"), where("user_id", "==", user.id)));
            querySnapshot.forEach((doc) => {
                // console.log(doc.id, " => ", doc.data());
                q.push(doc.data());
            });
            setProfileData(q);
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
        if (name && email) {
            await updateDoc(doc(db, "users", user.id), {
                name: name
            });
            tst("Profile updated successfully", "success");
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
                <title>Profile | {siteName}</title>
            </Head>
            <section className="container-fluid pb-5" style={{ background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                <section className="container d-flex justify-content-center align-items-center" style={{ height: "90vh", width: "100vw" }}>
                    <form onSubmit={handleSubmit} method="POST" className='p-5'>
                        <h5 className="mb-4 text-uppercase">Personal Details</h5>
                        <div className="mb-3">
                            <label htmlFor="name" className='form-label'>Name</label>
                            <input type="text" className="form-control" name="name" id="name" value={name} onChange={handleChange} placeholder="Name" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className='form-label'>Email address</label>
                            <input type="email" className="form-control" disabled name="email" id="email" value={email} onChange={handleChange} placeholder="user@ira.com" />
                        </div>
                        {!loading && <button type="submit" className="btn-main w-100 mt-2">Update</button>}
                        {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                            <Loader color={color} />
                        </div>}
                    </form>
                </section>
                <section className="container d-flex justify-content-center align-items-center">
                    <form className='p-5 profile-details'>
                        <h5 className="mb-4 text-uppercase">Other Details</h5>
                        {profileData && profileData.map((val, index) => {
                            return <div className="mb-3" key={index + 1}>
                                <label htmlFor="name" className='form-label' style={{ textAlign: "justify" }}><b>{val.question}</b></label>
                                <textarea className="form-control" value={val.answer} rows={1} disabled></textarea>
                            </div>
                        })}
                    </form>
                </section>
            </section>
        </>
    )
}

export default Profile