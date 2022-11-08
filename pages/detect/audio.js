import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from "../../firebase";
import { doc, addDoc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";
import Speech from 'speak-tts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../Components/Loader';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Audio = ({ siteName, color, user }) => {
    const router = useRouter();
    const [questions, setQuestions] = useState();
    const [order, setOrder] = useState();
    const [score, setScore] = useState();
    const [detect, setDetect] = useState();
    const [totalQuestions, setTotalQuestions] = useState();
    const [personality, setPersonality] = useState();
    const [loading, setLoading] = useState(false);
    var val = [];
    const videoRef = useRef(null);

    useEffect(() => {
        getVideo();
    }, [videoRef]);

    const getVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("error:", err);
            });
    };

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
        setOrder(JSON.parse(localStorage.getItem("ira-detect")) || 1);
        setScore(JSON.parse(localStorage.getItem("ira-score")) || 0);
        const getData = async () => {
            const u = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
            if (u.docs.length) {
                setPersonality(u.docs[0].data().personality);
                setDetect(u.docs[0].data().detect || 0);
                let q = [];
                const querySnapshot = await getDocs(collection(db, `${u.docs[0].data().personality}-questions-detection`));
                querySnapshot.forEach((doc) => {
                    q[doc.id] = doc.data();
                });
                setQuestions(q);
                setTotalQuestions(q.length);
            }
        }
        getData();
    }, []);

    useEffect(() => {
        if (document.getElementById("question") && questions) {
            const speech = new Speech();

            speech.init({
                "voice": "Veena",
            }).then((data) => {
                // The "data" object contains the list of available voices and the voice synthesis params
                // console.log("Speech is ready, voices are available", data)
                data.voice = data.voices[40].name;
                speech.setVoice("Veena");
                speech.speak({
                    text: questions[order].question,
                }).then(() => {
                    // console.log("Success !")
                }).catch(e => {
                    // console.error("An error occurred :", e)
                })
            }).catch(e => {
                console.error("An error occured while initializing : ", e)
            })

        }
    }, [order, router]);

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

    const audioStart = () => {
        var source;
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var analyser = audioContext.createAnalyser();
        analyser.minDecibels = -100;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        if (!navigator?.mediaDevices?.getUserMedia) {
            // No audio allowed
            alert('Sorry, getUserMedia is required for the app.')
            return;
        } else {
            var constraints = { audio: true };
            navigator.mediaDevices.getUserMedia(constraints)
                .then(
                    function (stream) {
                        // Initialize the SourceNode
                        source = audioContext.createMediaStreamSource(stream);
                        // Connect the source node to the analyzer
                        source.connect(analyser);
                        visualize();
                    }
                )
                .catch(function (err) {
                    // alert(err);
                    alert('Sorry, microphone permissions are required for the app. Feel free to read on without playing :)')
                });
        }

        // Visualizing, copied from voice change o matic
        var canvas = document.querySelector('.visualizer');
        var canvasContext = canvas.getContext("2d");
        var WIDTH;
        var HEIGHT;

        function visualize() {
            WIDTH = canvas.width;
            HEIGHT = canvas.height;
            var drawVisual;
            var drawNoteVisual;

            var draw = function () {
                drawVisual = requestAnimationFrame(draw);
                analyser.fftSize = 2048;
                var bufferLength = analyser.fftSize;
                var dataArray = new Uint8Array(bufferLength);
                analyser.getByteTimeDomainData(dataArray);

                canvasContext.fillStyle = 'rgb(200, 200, 200)';
                canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

                canvasContext.lineWidth = 2;
                canvasContext.strokeStyle = 'rgb(0, 0, 0)';

                canvasContext.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasContext.moveTo(x, y);
                    } else {
                        canvasContext.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasContext.lineTo(canvas.width, canvas.height / 2);
                canvasContext.stroke();
            }

            var previousValueToDisplay = 0;
            var smoothingCount = 0;
            var smoothingThreshold = 5;
            var smoothingCountThreshold = 5;

            // Thanks to PitchDetect: https://github.com/cwilso/PitchDetect/blob/master/js/pitchdetect.js
            var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            function noteFromPitch(frequency) {
                var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
                return Math.round(noteNum) + 69;
            }

            var drawNote = function () {
                drawNoteVisual = requestAnimationFrame(drawNote);
                var bufferLength = analyser.fftSize;
                var buffer = new Float32Array(bufferLength);
                analyser.getFloatTimeDomainData(buffer);
                var autoCorrelateValue = autoCorrelate(buffer, audioContext.sampleRate)

                var valueToDisplay = autoCorrelateValue;
                valueToDisplay = Math.round(valueToDisplay);

                if (autoCorrelateValue === -1) {
                    document.getElementById('note') ? document.getElementById('note').innerText = 'Too quiet...' : null;
                    return;
                }

                function noteIsSimilarEnough() {
                    // Check threshold for number, or just difference for notes.
                    if (typeof (valueToDisplay) == 'number') {
                        return Math.abs(valueToDisplay - previousValueToDisplay) < smoothingThreshold;
                    } else {
                        return valueToDisplay === previousValueToDisplay;
                    }
                }
                // Check if this value has been within the given range for n iterations
                if (noteIsSimilarEnough()) {
                    if (smoothingCount < smoothingCountThreshold) {
                        smoothingCount++;
                        return;
                    } else {
                        previousValueToDisplay = valueToDisplay;
                        smoothingCount = 0;
                    }
                } else {
                    previousValueToDisplay = valueToDisplay;
                    smoothingCount = 0;
                    return;
                }

                if (valueToDisplay != "Too quiet...") {
                    val.push(valueToDisplay);
                }

                if (typeof (valueToDisplay) == 'number') {
                    valueToDisplay += ' Hz';
                }

                document.getElementById('note').innerText = valueToDisplay;
            }

            var drawFrequency = function () {
                var bufferLengthAlt = analyser.frequencyBinCount;
                var dataArrayAlt = new Uint8Array(bufferLengthAlt);

                canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

                var drawAlt = function () {
                    drawVisual = requestAnimationFrame(drawAlt);

                    analyser.getByteFrequencyData(dataArrayAlt);

                    canvasContext.fillStyle = 'rgb(0, 0, 0)';
                    canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

                    var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
                    var barHeight;
                    var x = 0;

                    for (var i = 0; i < bufferLengthAlt; i++) {
                        barHeight = dataArrayAlt[i];

                        canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                        canvasContext.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                        x += barWidth + 1;
                    }
                };
                drawAlt();
            }
            drawNote();
            drawFrequency();
        }
    }

    function autoCorrelate(buffer, sampleRate) {
        // Perform a quick root-mean-square to see if we have enough signal
        var SIZE = buffer.length;
        var sumOfSquares = 0;
        for (var i = 0; i < SIZE; i++) {
            var val = buffer[i];
            sumOfSquares += val * val;
        }
        var rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
        if (rootMeanSquare < 0.01) {
            return -1;
        }

        // Find a range in the buffer where the values are below a given threshold.
        var r1 = 0;
        var r2 = SIZE - 1;
        var threshold = 0.2;

        // Walk up for r1
        for (var i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buffer[i]) < threshold) {
                r1 = i;
                break;
            }
        }

        // Walk down for r2
        for (var i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buffer[SIZE - i]) < threshold) {
                r2 = SIZE - i;
                break;
            }
        }

        // Trim the buffer to these ranges and update SIZE.
        buffer = buffer.slice(r1, r2);
        SIZE = buffer.length

        // Create a new array of the sums of offsets to do the autocorrelation
        var c = new Array(SIZE).fill(0);
        // For each potential offset, calculate the sum of each buffer value times its offset value
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - i; j++) {
                c[i] = c[i] + buffer[j] * buffer[j + i]
            }
        }

        // Find the last index where that value is greater than the next one (the dip)
        var d = 0;
        while (c[d] > c[d + 1]) {
            d++;
        }

        // Iterate from that index through the end and find the maximum sum
        var maxValue = -1;
        var maxIndex = -1;
        for (var i = d; i < SIZE; i++) {
            if (c[i] > maxValue) {
                maxValue = c[i];
                maxIndex = i;
            }
        }

        var T0 = maxIndex;

        // Not as sure about this part, don't @ me
        // From the original author:
        // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
        // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
        // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
        var x1 = c[T0 - 1];
        var x2 = c[T0];
        var x3 = c[T0 + 1]

        var a = (x1 + x3 - 2 * x2) / 2;
        var b = (x3 - x1) / 2
        if (a) {
            T0 = T0 - b / (2 * a);
        }

        return sampleRate / T0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let sum = 0;
        for (let i = 0; i < val.length; i++) {
            sum += val[i];
        }
        let avg = sum / val.length;
        avg = Number(avg.toFixed(2));

        setLoading(true);
        if (avg) {
            let query = await addDoc(collection(db, "detection"), {
                question: questions[order].question,
                frequency: avg,
                detect: detect + 1,
                user_id: user.id
            });
            if (query.id) {
                tst("Answer submitted successfully", "success");
                localStorage.setItem("ira-detect", JSON.stringify(order + 1));
                localStorage.setItem("ira-score", JSON.stringify(score + avg));
                if (order == questions.length - 1) {
                    await updateDoc(doc(db, "users", user.id), {
                        detect: detect + 1,
                    });
                    localStorage.setItem("ira-data", JSON.stringify({
                        type: "audio",
                        data: score,
                        length: questions.length,
                        detect: detect + 1,
                        personality: personality
                    }));
                    localStorage.removeItem("ira-score");
                    localStorage.removeItem("ira-detect");
                    router.push('/result');
                } else {
                    setScore(avg + score);
                    setOrder(order + 1);
                }
            } else {
                tst("Something went wrong", "error");
            }
        } else {
            tst("Please say again", "error");
        }
        setLoading(false);
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
                <title>Mood Detection | {siteName}</title>
            </Head>
            <div className="back-to-home">
                <Link href={"/"}><a>← Home</a></Link>
            </div>
            <div className="progress-bar">
                <CircularProgressbar
                    value={(order == 1) ? 0 : (order / totalQuestions) * 100}
                    text={(order == 1) ? '0%' : `${Number(((order / totalQuestions) * 100).toFixed(1))}%`}
                    styles={buildStyles({
                        pathColor: "#FD365C",
                        textColor: "#FD365C",
                        trailColor: "#FFFFFF",
                    })}
                />
            </div>
            <section className="d-flex justify-content-center align-items-center flex-wrap" style={{ height: "100vh", width: "100vw", background: "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(126, 27, 64, 1) 20%, rgba(253, 54, 92, 1) 73%, rgba(0, 212, 255, 1) 100%)" }}>
                {questions && questions.length > 0 && order < questions.length ? <>
                    <div className="mx-5" style={{ width: "40%", height: "70%" }}>
                        <div className="videobox">
                            <video ref={videoRef} />
                        </div>
                        <div className="audiobox">
                            <canvas className='visualizer' width="640" height="100" fill="#000"></canvas>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btns d-flex justify-content-center align-items-center">
                                <button className='btn btn-sm m-2 text-light' onClick={audioStart}>Start</button>
                                {!loading && <button className='btn btn-sm m-2 text-light' onClick={handleSubmit}>Stop</button>}
                                {loading && <div className="loader d-inline justify-content-center align-items-center" id="loader">
                                    <Loader color={color} />
                                </div>}
                            </div>
                            <h3 id='note'>Too quiet...</h3>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} method="POST" className='p-5 mx-4'>
                        <h5 id="question">{questions[order].question}</h5>
                    </form>
                </> : <Loader color={color} />}
            </section>
        </>
    )
}

export default Audio;