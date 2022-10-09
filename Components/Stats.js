import React from 'react';
import { FaTruck, FaUsers } from 'react-icons/fa';
import { MdPlace } from 'react-icons/md';
import { AiOutlineShop } from 'react-icons/ai';

const Stats = () => {
    return (
        <>
            <section className="stats">
                <div className="m-4 mx-auto text-center d-flex justify-content-around align-items-center cont">
                    <div className="p-4 box w-25">
                        <div className="border border-3 border-primary py-3 rounded-3">
                            <div className="flex justify-center mb-1 icon">
                                <FaTruck />
                            </div>
                            <h2 className="title">99+</h2>
                            <p className="text-secondary">Orders Completed</p>
                        </div>
                    </div>
                    <div className="p-4 box w-25">
                        <div className="border border-3 border-primary py-3 rounded-3">
                            <div className="flex justify-center mb-1 icon">
                                <FaUsers />
                            </div>
                            <h2 className="title">1.3K+</h2>
                            <p className="text-secondary">Happy Customers</p>
                        </div>
                    </div>
                    <div className="p-4 box w-25">
                        <div className="border border-3 border-primary py-3 rounded-3">
                            <div className="flex justify-center mb-1 icon">
                                <AiOutlineShop />
                            </div>
                            <h2 className="title">2.7K+</h2>
                            <p className="text-secondary">Products</p>
                        </div>
                    </div>
                    <div className="p-4 box w-25">
                        <div className="border border-3 border-primary py-3 rounded-3">
                            <div className="flex justify-center mb-1 icon">
                                <MdPlace />
                            </div>
                            <h2 className="title">50+</h2>
                            <p className="text-secondary">Places</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Stats