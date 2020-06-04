import React, { Component } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import './../styles/style.scss'
const audioType = "audio/*";

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {},
      seconds: 0,
      isPaused: false,
      recording: false,
      medianotFound: false,
      audios: [],
      audioBlob: null,
      uploaded: false,
      upload_response : null,
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  handleAudioUpload(e){
    this.setState({
      uploaded : true,
      upload_response: "http://todo",
    });
    this.props.handleAudioUpload(e);
  }

  handleAudioPause(e) {
    e.preventDefault();
    clearInterval(this.timer);
    this.mediaRecorder.pause();
    this.setState({ pauseRecord: true });
  }
  handleAudioStart(e) {
    e.preventDefault();
    this.startTimer();
    this.mediaRecorder.resume();
    this.setState({ pauseRecord: false });
  }

  startTimer() {
    //if (this.timer === 0 && this.state.seconds > 0) {
    this.timer = setInterval(this.countDown, 1000);
    //}
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds + 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds
    });
  }

  secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds
    };
    return obj;
  }

  async componentDidMount() {
    console.log(navigator.mediaDevices);
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
    } else {
      this.setState({ medianotFound: true });
      console.log("Media Decives will work only with SSL.....");
    }
  }

  startRecording(e) {
    this.handleRest()
    e.preventDefault();
    // wipe old data chunks
    this.chunks = [];
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    this.startTimer();
    // say that we're recording
    this.setState({ recording: true });
  }

  stopRecording(e) {
    clearInterval(this.timer);
    this.setState({ time: {} });
    e.preventDefault();
    // stop the recorder
    this.mediaRecorder.stop();
    // say that we're not recording
    this.setState({ recording: false });
    // save the video to memory
    this.saveAudio();
  }

  handleRest() {
    this.setState({
      time: {},
      seconds: 0,
      isPaused: false,
      recording: false,
      medianotFound: false,
      audios: [],
      audioBlob: null,
      uploaded: false,
      upload_response: null
    });
    this.props.handleRest(this.state);
  }

  saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    const audios = [audioURL];
    this.setState({ audios, audioBlob: blob });
    this.props.handleAudioStop({
      url: audioURL,
      blob: blob,
      chunks: this.chunks,
      duration: this.state.time
    });
  }

      
  render() {
    const { recording, audios, time, medianotFound, uploaded, upload_response  } = this.state;
    const { showUIAudio, title, audioURL } = this.props;
    return (

            <div>
                  <div>
                  <button
                    onClick={() =>
                      this.handleAudioUpload(this.state.audioBlob)
                    }
                    className="btn upload-btn"
                  >
                    Upload
                  </button>
                  </div>

                  <div>
                  <button
                    onClick={() => this.handleRest()}
                    className="btn clear-btn"
                  >
                    Clear
                  </button>
                  </div>

                  <div>
                    {audioURL !== null && showUIAudio ? (
                      <audio controls>
                        <source src={audios[0]} type="audio/ogg" />
                        <source src={audios[0]} type="audio/mpeg" />
                      </audio>
                    ) : null}
                    {uploaded ? (
                      <audio controls>
                        <source src={upload_response} type="audio/ogg" />
                        <source src={upload_response} type="audio/mpeg" />
                      </audio>
                    ) : null} 
                  </div>

                  <div className="duration">
                    <span className="mins">
                      {time.m !== undefined
                        ? `${time.m <= 9 ? "0" + time.m : time.m}`
                        : "00"}
                    </span>
                    <span className="divider">:</span>
                    <span className="secs">
                      {time.s !== undefined
                        ? `${time.s <= 9 ? "0" + time.s : time.s}`
                        : "00"}
                    </span>
                  </div>
                  <div>
                  {!recording ? (
                    <p className="help">Press the microphone to record</p>
                  ) : null}
                </div>
                <div>
                {!recording ? (
                  <a
                    onClick={e => this.startRecording(e)}
                    href=" #"
                    className="mic-icon"
                  >
                    <FaMicrophone />
                  </a>
                ) : (
           
                    <a
                      onClick={e => this.stopRecording(e)}
                      href=" #"
                      className="icons stop"
                    >
                      <FaStop />
                    </a>
                )}
               </div>
        </div>
    );
  }
}

export default Recorder;
