(function(window){
  function Lyric(path) {
    return new Lyric.prototype.init(path)
  }
  Lyric.prototype = {
    constructor: Lyric,
    init: function(path){
      this.path = path;
    },
    times: [],//保存时间
    lyrics: [],//保存歌词
    index: -1,//记录当前索引
    pausedIndex: -1,//暂停时的索引值
    /**
     * 加载歌词
     */
    loadLyric: function(callback){
      var $this = this;
      $.ajax({
        url: $this.path,
        dataType: 'text',
        success: function (data) {
          $this.parseLyric(data);
          return callback();
        },
        error: function(err){}
      })
    },
    /**
     * 解析歌词
     * @param data
     */
    parseLyric: function(data){
      var $this = this;
      //清空上一首歌曲的歌词和时间
      $this.times = [];
      $this.lyrics = [];
      var array = data.split("\n");
      //[00:00]
      //时间的正则表达式
      var timeReg = /\[(\d*:\d*\.\d*)\]/
      //遍历取出每一条歌词和对应的时间
      $.each(array, function(index, value){
        //处理歌词
        var lyric = value.split("]")[1];
        //排除空字符串（没有歌词的）
        if(lyric.length === 1) return;
        $this.lyrics.push(lyric);

        //处理时间
        var res = timeReg.exec(value);
        if(res === null) return;
        var timeStr = res[1];
        var res2 = timeStr.split(":");
        var min = parseInt(res2[0]) * 60;
        var sec = parseFloat(res2[1]);
        var time = parseFloat((min + sec).toFixed(2));
        $this.times.push(time);
      })
    },
    currentIndex: function(currentTime){
      if(currentTime > this.times[0]){
        this.index ++;
        this.times.shift();//删除数组最前面的一个元素
        this.pausedIndex = this.index;
      }
      return this.index
    }
  }
  Lyric.prototype.init.prototype = Lyric.prototype;
  window.Lyric = Lyric;
})(window)