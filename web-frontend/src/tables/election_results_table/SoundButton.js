import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Howl } from 'howler';
import { MdVoiceOverOff, MdRecordVoiceOver } from "react-icons/md";
import msncElection2022 from '../../sounds/msnbc_election_2022.wav';
// Define sound outside of component function
const sound = new Howl({
    src: [msncElection2022],
    autoplay: false,
    loop: true,
    volume: 0.3,
    onend: function () {
        console.log('Finished!');
    }
});
function SoundButton({ type }) {
    const [isPlaying, setIsPlaying] = useState(false);
    let icon;
    switch (type) {
        case "on":
            icon = _jsx(MdVoiceOverOff, { color: '#6B7280' });
            break;
        case "off":
            icon = _jsx(MdRecordVoiceOver, { color: '#6B7280' });
            break;
        default:
            icon = null;
    }
    return (_jsx("div", { className: 'flex items-center bg-gray-200 p-2 pl-3 pr-3 rounded-sm hover:bg-gray-300', children: _jsx("button", { onClick: () => {
                if (type === "on") {
                    if (!isPlaying) {
                        sound.play();
                        setIsPlaying(true);
                    }
                    else {
                        sound.pause();
                        setIsPlaying(false);
                    }
                }
                else {
                    sound.pause();
                    setIsPlaying(false);
                }
            }, children: _jsx("div", { children: icon }) }) }));
}
export default SoundButton;
