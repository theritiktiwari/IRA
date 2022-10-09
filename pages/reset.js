import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Reset = ({ siteName, logo }) => {
    return (
        <>
            <Head>
                <title>RESET PASSWORD | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                <form method="POST" className='p-5 w-50'>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase">Reset Password</h5>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" name="email" id="email" placeholder="name@example.com" />
                        <label for="email">Email address</label>
                    </div>
                    <button type="submit" className="btn-main w-100 mt-2">Reset Now</button>
                    <div className="d-flex justify-content-end align-items-center mt-3">
                        <Link href={"/login"}><a className='link'>Back to Login ?</a></Link>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Reset