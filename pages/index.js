import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import About from '../Components/About';
import Stats from '../Components/Stats';
import Contact from '../Components/Contact';
const main_image = "https://i.pinimg.com/736x/52/4e/cb/524ecba63c6964e48fb2c90502c16ae1.jpg";

const Index = ({ siteName }) => {
  return (
    <>
      <Head>
        <title>HOME | {siteName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="container-fluid main mx-auto d-flex justify-content-center align-items-center">
        <div className="text text-center">
          <h1 className="display-2 fw-bold bg-dark px-4">IRA : Mood Detection</h1>
          {/* <p className="lead">This is a portal for Mood detection, by which a person can detect his mood.</p>
            <Link href="/signup">
              <a className="btn btn-main btn-lg">Get Started</a>
            </Link> */}
        </div>
      </section>

      <About siteName={siteName} />
      <Stats />
      <Contact />
    </>
  )
}

export default Index