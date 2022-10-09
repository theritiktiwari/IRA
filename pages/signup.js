import React from 'react'
import Link from 'next/link'
import Head from 'next/head'

const Signup = ({ siteName, logo }) => {
    return (
        <>
            <Head>
                <title>SIGNUP | {siteName}</title>
            </Head>
            <section className="auth d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw" }}>
                <form method="POST" className='p-5 w-50'>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><Link href={"/"}><a><img src={logo} alt="logo" className='mb-2' width="100" /></a></Link></div> : null}
                    <h5 className="mb-4 text-uppercase">Signup</h5>
                    <div className="form-floating mb-3">
                        <input type="name" className="form-control" name="name" id="name" placeholder="Name" />
                        <label for="name">Name</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" name="email" id="email" placeholder="name@example.com" />
                        <label for="email">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" name="password" id="password" placeholder="Password" />
                        <label for="password">Password</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="confirmPassword" className="form-control" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" />
                        <label for="confirmPassword">Confirm Password</label>
                    </div>
                    <button type="submit" className="btn-main w-100 mt-2">Signup</button>
                    <div className="d-flex justify-content-end align-items-center mt-3">
                        <Link href={"/login"}><a className='link'>Login ?</a></Link>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Signup