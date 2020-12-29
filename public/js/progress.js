(function(window){
  function Progress($progressBar, $progressLine, $progressDot){
    return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
  }
  Progress.prototype = {
    constructor: Progress,
    init: function($progressBar, $progressLine, $progressDot){
      this.$progressBar = $progressBar;
      this.$progressLine = $progressLine;
      this.$progressDot = $progressDot;
    },
    isMove: false,//是否正在进行拖拽
    /**
     * 进度条的点击事件
     */
    progressClick: function(callback){
      var $this = this;
      //监听背景的点击
      this.$progressBar.click(function(event){
        //获取背景距离窗口的默认位置
        var defaultLeft = $(this).offset().left;
        //获取点击的位置距离窗口的位置
        var eventLeft = event.pageX;
        var diff = eventLeft - defaultLeft;
        if(diff < 0) diff = 0;
        if(diff > $(this).width()) diff = $(this).width();
        //设置前景的宽度
        $this.$progressLine.css("width", diff);
        //设置原点的左偏移量
        $this.$progressDot.css("left", diff);
        //计算进度条的比例
        var ratio = (eventLeft - defaultLeft) / $(this).width();
        return callback(ratio)
      })
    },
    /**
     * 进度条的拖拽事件
     */
    progressMove: function(callback){
      var $this = this;
      var defaultLeft;
      var eventLeft;
      var diffValue;
      //1.监听鼠标按下事件
      this.$progressBar.mousedown(function(){
        $this.isMove = true
        //获取背景距离窗口的默认位置
        defaultLeft = $(this).offset().left;
        //2.监听鼠标移动事件
        $(document).mousemove(function(event){
          //获取点击的位置距离窗口的位置
          eventLeft = event.pageX;
          diffValue = eventLeft - defaultLeft;
          if(diffValue < 0) diffValue = 0;
          if(diffValue > $this.$progressBar.width()) diffValue = $this.$progressBar.width();
          //设置前景的宽度
          $this.$progressLine.css("width", diffValue);
          //设置原点的左偏移量
          $this.$progressDot.css("left", diffValue);
        })
        //3.监听鼠标抬起事件
        $(document).mouseup(function(){
          $(document).off("mousemove")
          $this.isMove = false;
          //计算进度条的比例
          var ratio = diffValue / $($this.$progressBar).width();
          return callback(ratio)
        })
      })
    },
    /**
     * 根据时间比例设置进度条
     */
    setProgress: function(ratio){
      if(this.isMove) return;
      if(isNaN(ratio)) return;
      if(ratio < 0 || ratio > 100) return;
      //设置前景的宽度
      this.$progressLine.css("width", ratio + "%");
      //设置原点的左偏移量
      this.$progressDot.css("left", ratio + "%");

    }
  }
  Progress.prototype.init.prototype = Progress.prototype;
  window.Progress = Progress;
})(window)