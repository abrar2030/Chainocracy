import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import BottomBackgroundCandidateYellow from '../../assets/candidates/bottom_background_candidates_yellow.svg';
import BottomBackgroundCandidateRed from '../../assets/candidates/bottom_background_candidates_red.svg';
import BottomBackgroundCandidateBlack from '../../assets/candidates/bottom_background_candidates_black.svg';
import TopCountryBackground from '../../assets/candidates/topCountryBackground.svg';
import bottomCountryBackground from '../../assets/candidates/bottomCountryBackground.svg';
import "./style.scss";
import defaultPhoto from '@/assets/candidates/candidateImage.png';
export default function CardCandidates({ data, animationStyle }) {
    const dataOther = data.slice(2);
    const backgroundColor = "#515151";
    const otherCandidates = (item) => {
        return _jsxs("div", { className: "", children: [_jsxs("div", { className: "flex flex-col bg-white relative h-max", children: [_jsx("div", { className: "p-3", style: { backgroundColor: backgroundColor, width: '100', height: '100%' }, children: _jsx("img", { src: TopCountryBackground, alt: "TopBackground" }) }), _jsx("div", { style: { width: '100', height: '100%' }, children: _jsx("img", { src: BottomBackgroundCandidateBlack, alt: "BottomBackground" }) }), _jsx("img", { src: item.candidadePhoto ?? defaultPhoto, alt: "Foreground", style: {
                                maxWidth: '65%',
                                height: 'auto',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1
                            } })] }), _jsxs("div", { className: "flex flex-row mt-0.5", style: { backgroundColor: '#515151' }, children: [_jsx("div", { className: "flex items-center ml-6 bg-white p-2", children: _jsxs("span", { className: "font-bold justify-center items-center", style: { color: '#515151', fontSize: '1.3rem' }, children: [item.percentage, "%"] }) }), _jsxs("div", { className: "ml-2.5 flex flex-col justify-start", children: [_jsx("span", { className: "font-bold", style: { fontSize: '1rem', color: '#FBFAFA' }, children: item.candidate }), _jsx("span", { className: "font-bold justify-start", style: { fontSize: '0.6rem', color: '#FBFAFA' }, children: item.numVotes })] })] })] }, item.id);
    };
    return (_jsxs("div", { className: "flex flex-col gap-2 bg-red", children: [_jsxs("div", { className: "bg-white", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: animationStyle, children: [_jsxs("div", { className: "flex flex-col bg-white relative", children: [_jsx("div", { className: "p-3", style: { backgroundColor: backgroundColor }, children: _jsx("img", { src: TopCountryBackground, alt: "TopBackground" }) }), _jsx("div", { children: _jsx("img", { src: BottomBackgroundCandidateRed, alt: "BottomBackground" }) }), _jsx("img", { src: data[0].candidadePhoto ?? defaultPhoto, alt: "Foreground", style: {
                                                    maxWidth: '65%',
                                                    height: 'auto',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 1
                                                } })] }), _jsxs("div", { className: "flex flex-row mt-0.5", style: { backgroundColor: '#DF2E2D' }, children: [_jsx("div", { className: "flex items-center ml-6 bg-white p-2", children: _jsxs("span", { className: "font-bold justify-center items-center", style: { color: '#CE2524', fontSize: '1.5rem' }, children: [data[0].percentage, "%"] }) }), _jsxs("div", { className: "ml-2.5 flex flex-col justify-start", children: [_jsx("span", { className: "font-bold", style: { fontSize: '1.6rem', color: '#FBFAFA' }, children: data[0].candidate }), _jsx("span", { className: "font-bold justify-start", style: { fontSize: '1.2rem', color: '#FBFAFA' }, children: data[0].numVotes })] })] })] }), _jsxs("div", { className: "", children: [_jsxs("div", { className: "flex flex-col bg-white relative", children: [_jsx("div", { className: "p-3", style: { backgroundColor: backgroundColor }, children: _jsx("img", { src: TopCountryBackground, alt: "TopBackground" }) }), _jsx("div", { children: _jsx("img", { src: BottomBackgroundCandidateYellow, alt: "BottomBackground" }) }), _jsx("img", { src: data[1].candidadePhoto ?? defaultPhoto, alt: "Foreground", style: {
                                                    maxWidth: '65%',
                                                    height: 'auto',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 1
                                                } })] }), _jsxs("div", { className: "flex flex-row mt-0.5", style: { backgroundColor: '#F4E16C' }, children: [_jsx("div", { className: "flex items-center ml-6 bg-white p-2", children: _jsxs("span", { className: "font-bold justify-center items-center", style: { color: '#E9D766', fontSize: '1.5rem' }, children: [data[1].percentage, "%"] }) }), _jsxs("div", { className: "ml-2.5 flex flex-col justify-start", children: [_jsx("span", { className: "font-bold", style: { fontSize: '1.6rem', color: '#FBFAFA' }, children: data[1].candidate }), _jsx("span", { className: "font-bold justify-start", style: { fontSize: '1.2rem', color: '#FBFAFA' }, children: data[1].numVotes })] })] })] })] }), _jsxs("div", { className: "flex flex-row items-center justify-center p-2 gap-5", style: { backgroundColor: '#515151' }, children: [_jsx("img", { className: "flex", src: bottomCountryBackground, alt: "Background", width: '30%', height: '40%' }), _jsxs("span", { className: 'font-inria-sans font-bold text-gray-500 justify-center items-center', style: { fontSize: '1rem', color: '#AFAFAF' }, children: ["DIFFERENCE ", Number((data[0].percentage - data[1].percentage).toFixed(2)), "%"] }), _jsx("img", { className: "flex", src: bottomCountryBackground, alt: "Background", width: '30%', height: '40%' })] })] }), _jsx("div", { children: _jsx("div", { className: "grid grid-cols-3 gap-1", children: dataOther.map((item) => otherCandidates(item)) }) })] }));
}
