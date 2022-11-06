import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Loader from '../Components/Loader';

const Result = ({ siteName, logo, user, color }) => {
    const [data, setData] = useState({ type: "", data: 0, length: 0, detect: 0, personality: "" });
    const [state, setState] = useState();
    const [suggestion, setSuggestion] = useState();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem("ira-user"))
            router.push("/");
    }, [router]);

    useEffect(() => {
        const d = JSON.parse(localStorage.getItem("ira-data"));
        if (d) {
            setData({ type: d.type, data: d.data, length: d.length, detect: d.detect, personality: d.personality });
            var mood;
            if (d.type == "text") {
                let moodData = count(d.data);
                let m = Object.keys(moodData).reduce((a, b) => moodData[a] > moodData[b] ? a : b);
                let moodPercentage = Math.round((moodData[m] / d.length) * 100);
                mood = (m == 1) ? "Happy" : (m == 2) ? "Sad" : (m == 3) ? "Angry" : (m == 4) ? "Confused" : "";
                setState({ mood, moodPercentage });
            } else if (d.type == "audio") {
                let moodData = Number((d.data / (d.length - 1)).toFixed(2));
                mood = (moodData >= 0 && moodData <= 160) ? "Sad" : (moodData > 160 && moodData <= 230) ? "Confused" : (moodData > 230 && moodData <= 300) ? "Happy" : (moodData > 300) ? "Angry" : "";
                setState({ mood });
            }

            if (d.personality == "adventurous") {
                if (mood == "Happy")
                    setSuggestion("It's time to be a little adventurous! Is there something you've wanted to do lately or some place you've always wanted to go but never made the time to go there ? Well, now's your chance to do it! Enjoy your time...");
                else if (mood == "Sad")
                    setSuggestion("No matter how we're feelings, animals just have a way of making us happy again. Spend some time out in nature observing wildlife...\n Even just petting someone else's dog or seeing dogs enjoy their walks can really brighten your day maybe ? ");
                else if (mood == "Angry")
                    setSuggestion("Exploring the great outdoors is a magical, yet very humbling experience for everyone.\n Go visit your local park, the mountains, a field, the beach, a river, or the desert. It's one of the best solutions for an angry heart.");
                else if (mood == "Confused")
                    setSuggestion("A great thing to do when you're confused is to exercise: It helps you go to sleep, reduce stress, increase your energy levels, and most of all - helps you feel happier!");
            } else if (d.personality == "introvert") {
                if (mood == "Happy")
                    setSuggestion("Change up your outfit for the day. Get a haircut or trim up your bangs. Try out a new makeup look. Use a new perfume! Enjoy your day as \"Life is beautiful and so are you!\" \n Spending sometime pampering yourself can be a good way to celebrate!");
                else if (mood == "Sad")
                    setSuggestion("Get out there and experience a change in scenery. Watch the clouds, take in the trees, and just enjoy a good walk or bike ride. Even if it's just up and down your street - do it! \n \"Sometimes, the nature is all that you need.\"");
                else if (mood == "Angry")
                    setSuggestion("Writing in a journal is a great way to cope with one's feelings: It acts almost as if you are sharing your thoughts with someone else, except it's private place just for you... Try writing down what you feel because as we say, \"Pen is the tongue of your mind!\"");
                else if (mood == "Confused")
                    setSuggestion("Listen to your favourite songs. Whenever you feel confused, this can be an absolute must for you! Music really does help to soothe a confused soul. \n And as you’re listening to your favourite songs, why don’t you dance along to them too ? Cause you know what ? Music and rhythm are to the soul what words are to the mind...");
            } else if (d.personality == "peacemaker") {
                if (mood == "Happy")
                    setSuggestion("Comfort food is the best. Especially when you eat it while watching your favourite YouTube channel or television show. Try whipping up your favourite comfort food and relish the taste of your food because I would say \"Good food, Great life!!\"");
                else if (mood == "Sad")
                    setSuggestion("Do what you need to do. Is there one thing in your life that you have an inkling of a feeling you should try, but the easy thing to do is avoid it? To keep living life as you are living it now? \n So - go on! We have a long life to live - spend it chasing your passions.");
                else if (mood == "Angry")
                    setSuggestion("It can be really helpful to write a list about everything you love about yourself. \n Remind yourself of these things everyday while building onto that list.Recognize the good - and remember what an amazing person you are, no matter what you may be feeling right now. You are amazing!");
                else if (mood == "Confused")
                    setSuggestion("Sometimes the best thing to do when we're confused is to go inwards. Sit yourself down with some coffee or tea, a notebook, and have a conversation with yourself. \n Sometimes we get so caught up trying to learn about the world around us that we completely ignore what is going on inside ourselves!");
            } else if (d.personality == "confident") {
                if (mood == "Happy")
                    setSuggestion("Go to a local thrift store or find a new boutique somewhere - And buy something that adds on to your happiness! \n It's the element of surprise, plus the little quirkiness and cute that makes finding that item to special. The feeling of finding treasures and beautiful unique items that you wouldn't be able to find otherwise is beautiful!");
                else if (mood == "Sad")
                    setSuggestion("You can go spend some time with your friends . Talk it out with them... Or even if you don't, spending time with them just takes you away from your sad emotions and helps brings a smile to your face.");
                else if (mood == "Angry")
                    setSuggestion("When life gets a bit overwhelming, it can be a good idea to take a break from social media. \n I know many of us have our social media as practically a part of ourselves, but really... it's not. Spend some time with yourself, it will be beautiful indeed!");
                else if (mood == "Confused")
                    setSuggestion("Books are the best way to go for a little escape from reality. One book I highly recommend for you is The Book of Awakening by Mark Nepo. \n Good books don't give up all their secrets at once, and it helps you so much to bring clarity to your life and your thoughts!");
            }
        } else {
            router.push("/");
        }
    }, []);

    const count = (val) => {
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] == "1")
                count1++;
            else if (val[i] == "2")
                count2++;
            else if (val[i] == "3")
                count3++;
            else if (val[i] == "4")
                count4++;
        }
        return { 1: count1, 2: count2, 3: count3, 4: count4 };
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        var query;
        if (state.moodPercentage) {
            query = await addDoc(collection(db, "suggestions"), {
                detect: data.detect,
                mood: state.mood,
                percentage: state.moodPercentage,
                suggestion: suggestion,
                user_id: user.id
            });
        } else {
            query = await addDoc(collection(db, "suggestions"), {
                detect: data.detect,
                mood: state.mood,
                suggestion: suggestion,
                user_id: user.id
            });
        }
        if (query.id) {
            localStorage.removeItem("ira-data");
            router.push('/');
        }
        setLoading(false);
    }

    return (
        <>
            <Head>
                <title>Results | {siteName}</title>
            </Head>
            <section className="d-flex justify-content-center align-items-center" style={{ height: "100vh", width: "100vw", background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                {(data && suggestion) ? <form method="POST" className='p-5' onSubmit={handleSubmit}>
                    {logo ? <div className="d-flex justify-content-center align-items-center"><img src={logo} alt="logo" className='mb-2' width="100" /></div> : null}
                    <h5 className="mb-4 text-uppercase text-center display-6 fw-bold">Results</h5>
                    {state.moodPercentage && <div className='text-center'>You are <span className='fw-bold'>{state.moodPercentage}% {state.mood}</span></div>}
                    {!state.moodPercentage && <div className='text-center'>You seem to be <span className='fw-bold'>{state.mood}</span></div>}
                    <div className='text-center fw-bold mt-2'>{suggestion}</div>
                    {!loading && <button type="submit" className="btn-main w-100 mt-3">Back to Home</button>}
                    {loading && <div className="loader d-flex justify-content-center align-items-center" id="loader">
                        <Loader color={color} />
                    </div>}
                </form> : <Loader color={color} />}
            </section>
        </>
    )
}

export default Result