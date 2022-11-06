import React, { useEffect } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../../firebase";
import { getDocs, query, where, collection } from "firebase/firestore";

const Index = ({ siteName, user }) => {
    const router = useRouter();
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
    return (
        <>
            <Head>
                <title>Mood Detection | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="d-flex justify-content-center align-items-center flex-column" style={{ height: "100vh", width: "100vw" }}>
                <Link href={"/detect/text"}><button className="btn-main w-50 mt-3 fs-4">Answer some of my questions and <br /> let me detect your mood?</button></Link>
                <div className="mt-3 fw-bold fs-2">OR</div>
                <Link href={"/detect/audio"}><button className="btn-main w-50 mt-3 fs-4">Want to have a conversation with me?</button></Link>
            </section>
        </>
    )
}

export default Index;