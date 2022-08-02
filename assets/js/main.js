const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'DANGKHOA'

const player = $('.player')
const songName = $('header h2')
const singerName = $('header p')
const cd = $('.cd')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress =  $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist .playlist__list')
const playingTime = $('.playing-time')
const durationTime = $('.duration-time')
const volumeProgress = $('#volume-progress')
const valueVolumeProgress = $('.volume-value')
const muteBtn = $('.btn-volume-mute')
const upVolumeBtn = $('.btn-volume-up')
const downVolumeBtn = $('.btn-volume-down')

// Random lại 1 bài khi đã random hết playlist
let arrayRandom = []
let lenArrRandom = 0

const app = {
    currentIndex: 0,
    currentTime: 0,
    currentVolume: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMuted: false,
    isMobile: false,
    volumeBeforeMuted: 0,
    isOnMouseAndTouchOnProgress: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "As long As you Love me",
            singer: "Nasri Atweh",
            path: "./assets/music/as-long-as-you-love-me.mp3",
            image: "./assets/image/as-long-as-you-love-me.jpg"
        },
        {
            name: "Hạ Còn Vương Nắng",
            singer: "DATKAA x KIDO x Prod",
            path: "./assets/music/ha-con-vuong-nang .mp3",
            image: "./assets/image/ha-con-vuong-nang.jpg"
        },
        {
            name: "Tình Bạn Diệu Kỳ",
            singer: "AMEE x RICKY STAR x LĂNG LD",
            path: "./assets/music/tinh-ban-dieu-ky .mp3",
            image: "./assets/image/tinh-ban-dieu-ky.jpg"
        },
        {
            name: "Người Chơi Hệ Đẹp",
            singer: "(Cukak Remix) - 16 Typh",
            path: "./assets/music/nguoi-choi-he-dep.mp3",
            image: "./assets/image/nguoi-choi-he-dep.jpg"
        },
        {
            name: "Đường Tôi Chở Em Về",
            singer: "Buitruonglinh「Cukak Remix」",
            path: "./assets/music/duong-toi-cho-em-ve.mp3",
            image: "./assets/image/duong-toi-cho-em-ve.jpg"
        },
        {
            name: "Cứ Chill Thôi",
            singer: "Chillies, Suni Hạ Linh, Rhymastic",
            path: "./assets/music/cu-chill-thoi.mp3",
            image: "./assets/image/cu-chill-thoi.jpg"
        },
        {
            name: "Phố Đã Lên Đèn",
            singer: "Huyền Tâm Môn「Cukak Remix」",
            path: "./assets/music/pho-da-len-den.mp3",
            image: "./assets/image/pho-da-len-den.jpg"
        },
        {
            name: "Unstoppable",
            singer: "Sia",
            path: "./assets/music/unstoppable.mp3",
            image: "./assets/image/unstoppable.jpg"
        },
        {
            name: "She Sexy",
            singer: "Dendix Remix",
            path: "./assets/music/she-sexy.mp3",
            image: "./assets/image/she-sexy.jpg"
        },
        {
            name: "MUỘN RỒI MÀ SAO CÒN",
            singer: "SƠN TÙNG M-TP",
            path: "./assets/music/muon-roi-ma-sao-con.mp3",
            image: "./assets/image/muon-roi-ma-sao-con.jpg"
        }
    ],

    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render() {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>

                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>

                    <div class="music-waves ${index === this.currentIndex ? 'active' : ''}">  
                        <span></span>  
                        <span></span>  
                        <span></span>  
                        <span></span>  
                        <span></span>  
                    </div>
                </div>
            `
        })
        playlist.innerHTML += html.join('')
    },

    defineProperties() {
        // Getter
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý thay đổi kích thước màn hình
        window.onresize = function() {
            if (window.innerWidth < 740) {
                _this.isMobile = true
            } else {
                _this.isMobile = false
            }
            _this.setConfig("isMobile", _this.isMobile)
        }

        // Xử lý phóng to / thu nhỏ CD khi ở mobile
        document.onscroll = function() {
            if (_this.isMobile) {
                const scrollTop = window.scrollY || document.documentElement.scrollTop
                const newCdWidth = cdWidth - scrollTop
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
                cd.style.opacity = newCdWidth / cdWidth
            } else {
                cd.style.width = '250px'
                cd.style.opacity = '1'
            }
        }

        // Phát / dừng nhạc khi nhấn `space`
		document.onkeydown = function(e) {
			if(e.code === "Space") {
                e.preventDefault()
				if (_this.isPlaying) {
                    audio.pause()
                    playBtn.title = "Play"
                } else {  
                    audio.play()
                    playBtn.title = "Pause"
                }
			}
		}

        // Xử lý khi nhấn Play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
                playBtn.title = "Play"
            } else {  
                audio.play()
                playBtn.title = "Pause"
            }
        }

        // Khi audio phát nhạc
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            $$(".music-waves.active span").forEach(span => {
                span.classList.add('active')
            })
        }

        // Khi auto được tải lên
        audio.onloadedmetadata = function () {
            const minSec = _this.formatTime(audio.duration)
            durationTime.textContent = `${minSec[0]}:${minSec[1]}`
		}

        // Khi audio dừng phát nhạc
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
            $$(".music-waves.active span.active").forEach(span => {
                span.classList.remove('active')
            })
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration && !_this.isOnMouseAndTouchOnProgress) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                _this.setConfig("currentTime", audio.currentTime)

                let tmp = _this.formatTime(audio.currentTime)
                playingTime.textContent = `${tmp[0]}:${tmp[1]}`
            }
        }

        // Chạm chuột
        progress.onmousedown = function() {
            _this.isOnMouseAndTouchOnProgress = true
        }

        // Chạm
        progress.ontouchstart = function() {
            _this.isOnMouseAndTouchOnProgress = true
        }

        // Xử lý khi tua nhạc
        progress.oninput = function(e) {
            if (audio.duration) {
                const seekTime = audio.duration / 100 * e.target.value
                audio.currentTime = seekTime
                _this.isOnMouseAndTouchOnProgress = false
            }
        }

        // Xử lý khi thay đổi âm lượng
        volumeProgress.oninput = function(e) {
            audio.muted = false
            audio.volume = e.target.value / 100
            _this.currentVolume = audio.volume
            valueVolumeProgress.textContent = e.target.value
            _this.changeStyleVolume()
            _this.setConfig('currentVolume', _this.currentVolume)
        }

        // Xử lý tắt / mở tiếng
        upVolumeBtn.onclick = function() {
            _this.muteOrUnmuteVolume()
        }

        downVolumeBtn.onclick = function() {
            _this.muteOrUnmuteVolume()
        }

        muteBtn.onclick = function() {
            _this.muteOrUnmuteVolume()
        }

        // Khi nhấn next
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }

        // Khi nhấn prev
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.changeTitle()
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý bật / tắt repeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.changeTitle()
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio kết thúc
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lý khi nhấn vào song trong playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                audio.play()
            }
        }
    },

    // Xử lý màn hình kéo đến vị trí nhạc đang phát trong playlist
    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }, 100)
    },

    loadCurrentSong() {
        songName.textContent = this.currentSong.name
        singerName.textContent = this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        if (this.currentIndex == this.config.currentIndex) {
            audio.currentTime = this.currentTime
        } else {
            audio.currentTime = 0
        }

        this.setConfig("currentIndex", this.currentIndex)

        if ($('.song.active')) {
            $('.song.active').classList.remove('active')
            $('.music-waves.active').classList.remove('active')
        }

        const songList = $$('.song')
        const wavesSongList = $$('.music-waves')
        songList.forEach((song, index) => {
            if (Number(song.dataset.index) === this.currentIndex) {
                song.classList.add('active');
                wavesSongList[index].classList.add('active');
            }
        });
    },

    loadConfig() {
        this.isRandom = this.config.isRandom || this.isRandom
        this.isRepeat = this.config.isRepeat || this.isRepeat
        this.isMuted = this.config.isMuted || this.isMuted
        this.isMobile= this.config.isMobile || this.isMobile
        this.currentIndex = this.config.currentIndex || this.currentIndex
        this.currentTime = this.config.currentTime || this.currentTime
        this.currentVolume = this.config.currentVolume >= 0 ? this.config.currentVolume : this.currentVolume
        this.volumeBeforeMuted = this.config.volumeBeforeMuted >= 0 ? this.config.volumeBeforeMuted : this.volumeBeforeMuted
    },

    nextSong() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong() {
        let newIndex 
        newIndex = Math.floor(Math.random() * this.songs.length)

        if (lenArrRandom > 0) {
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
                var isExistArrRandom = arrayRandom.includes(newIndex)
            } while (isExistArrRandom)
        }

        arrayRandom[lenArrRandom] = newIndex

        this.currentIndex = newIndex
        this.loadCurrentSong()

        if (lenArrRandom === this.songs.length - 1) {
            arrayRandom = []
            lenArrRandom = -1
        }

        lenArrRandom++
    },

    formatTime(time) {
        const mins = Math.floor((time % 3600) / 60)
		const secs = Math.floor(time % 60)
        const minutes = mins < 10 ? `0${mins}` : mins
        const seconds = secs < 10 ? `0${secs}` : secs
		return [minutes, seconds]
    },

    changeTheme() {
        const _this = this
        const toggleSwitch = $('.theme-switch input[type="checkbox"]')
        const currentTheme = this.config.theme

        if (currentTheme) {
            document.documentElement.setAttribute("data-theme", currentTheme)

            if (currentTheme === "dark") {
                toggleSwitch.checked = true
            }
        }

        function switchTheme(e) {
            if (e.target.checked) {
                document.documentElement.setAttribute("data-theme", "dark")
                _this.setConfig('theme', "dark")
            } else {
                document.documentElement.setAttribute("data-theme", "light")
                _this.setConfig('theme', "light")
            }
        }

        toggleSwitch.addEventListener("change", switchTheme, false);
    },

    changeStyleVolume() {
        if (this.currentVolume === 0) {
            muteBtn.style.display = 'flex'
            downVolumeBtn.style.display = 'none'
            upVolumeBtn.style.display = 'none'
        }
        else if (this.currentVolume > 0 && this.currentVolume < 0.5) {
            muteBtn.style.display = 'none'
            downVolumeBtn.style.display = 'flex'
            upVolumeBtn.style.display = 'none'
        }
        else {
            muteBtn.style.display = 'none'
            downVolumeBtn.style.display = 'none'
            upVolumeBtn.style.display = 'flex'
        }
    },

    muteOrUnmuteVolume() {
        this.isMuted = !this.isMuted
        if (this.isMuted) {
            this.volumeBeforeMuted = this.currentVolume
            audio.muted = true
            volumeProgress.value = 0
            audio.volume = 0
            this.currentVolume = 0
        }
        else {
            audio.muted = false
            this.currentVolume = this.volumeBeforeMuted
            volumeProgress.value = this.currentVolume * 100
            audio.volume = this.currentVolume
        }
        valueVolumeProgress.textContent = this.currentVolume * 100
        this.setConfig('volumeBeforeMuted', this.volumeBeforeMuted)
        this.setConfig('isMuted', this.isMuted)
        this.setConfig('currentVolume', this.currentVolume)
        this.changeStyleVolume()
    },

    changeTitle() {
        this.isRepeat ? repeatBtn.title = 'Disable repeat' : repeatBtn.title = 'Enable repeat'
        this.isRandom ? randomBtn.title = 'Disable shuffle' : randomBtn.title = 'Enable shuffle'
    },

    start() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Change theme
        this.changeTheme()

        // Hiển thị trạng thái ban đầu của nút repeat, random, 
        // Thanh volume
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
        volumeProgress.value = (this.currentVolume * 100)
        audio.volume = this.currentVolume
        valueVolumeProgress.textContent =  volumeProgress.value

        this.changeStyleVolume()
        this.changeTitle()
    },
}

app.start()
