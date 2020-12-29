(function(window){
  function Player($audio){
    return new Player.prototype.init($audio);
  }
  Player.prototype = {
    constructor: Player,
    musicList: [],//前端接收到的音乐列表
    init: function($audio){
      this.$audio = $audio;
      this.audio = $audio.get(0);
    },
    currentIndex: -1,//当前索引
    currentTime: 0,//记录当前播放时间
    /**
     * 播放音乐
     * index 索引，
     * music 选中的音乐详细信息
     * */
    playMusic: function (index, music) {
      //判断是否是同一首音乐
      if(this.currentIndex === index){
        //同一首音乐
        if(this.audio.paused){
          this.audio.play();
        }else{
          this.audio.pause();
          this.audio.currentTime = this.currentTime;
        }
      }else{
        //不是同一首
        this.$audio.attr("src", music.link_url);
        this.audio.play();
        this.currentIndex = index
      }
    },
    /**
     * 获取上一首音乐索引
     * @returns {number}
     */
    preIndex: function(){
      var index = this.currentIndex - 1;
      if(index < 0){
        index = this.musicList.length - 1;
      }
      return index;
    },
    /**
     * 获取下一首音乐索引
     * @returns {number}
     */
    nextIndex: function(){
      var index = this.currentIndex + 1;
      if(index > this.musicList.length - 1){
        index = 0;
      }
      return index;
    },
    /**
     * 修改音乐列表，同时修改当前索引
     * @param index
     */
    changeMusicList: function(index){
      this.musicList.splice(index, 1)
      //判断当前删除的是否是正在播放音乐的前面的音乐
      if(index < this.currentIndex){
        this.currentIndex --;
      }
    },
    /**
     * 监听播放的进度
     */
    musicTimeUpdate: function(callback){
      var $this = this;
      this.$audio.on("timeupdate", function () {
        var duration = $this.audio.duration;//获取当前播放音乐的总时长
        if(isNaN(duration)) duration = 0;
        var currentTime = $this.audio.currentTime;//获取当前播放音乐的当前时刻
        $this.currentTime = currentTime;
        var progressTime = $this.timeFormat(duration, currentTime);
        return callback(currentTime, duration, progressTime)
      })
    },
    // 定义一个时间格式化方法，参数为秒数
    timeFormat: function(duration, currentTime){
      var endMin = parseInt(duration / 60);
      var endSec = parseInt(duration % 60);
      endMin = endMin < 10 ? "0" + endMin : endMin;
      endSec = endSec < 10 ? "0" + endSec : endSec;
      var startMin = parseInt(currentTime / 60);
      var startSec = parseInt(currentTime % 60);
      startMin = startMin < 10 ? "0" + startMin : startMin;
      startSec = startSec < 10 ? "0" + startSec : startSec;
      return startMin + ":" + startSec + " / " + endMin + ":" + endSec
    },
    /**
     * 根据进度条的比例跳到对应的时间点
     * @param ratio
     */
    musicSeekTo: function(ratio){
      if(isNaN(ratio)) return;
      this.audio.currentTime = this.audio.duration * ratio;
    },
    /**
     * 设置音量
     * @param value
     */
    musicVoiceSeekTo: function(value){
      if(isNaN(value)) return;
      //0~1
      if(value < 0 || value > 1) return;
      this.audio.volume = value;
    }
  }
  Player.prototype.init.prototype = Player.prototype;
  window.Player = Player;
})(window)