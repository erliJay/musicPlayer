$(function(){
  // 0.自定义滚动条
  $(".content_list").mCustomScrollbar()
  var $audio = $("audio");
  var player = new window.Player($audio);
  var musicProgress;
  var voiceProgress;
  var lyric;

  // 1.加载歌曲列表
  getPlayerList();
  function getPlayerList(){
    $.ajax({
      url:"public/source/musiclist.json",
      dataType: "json",
      success: function(data){
        player.musicList = data;
        // 1.1 遍历获取到的数据，创建每一条音乐
        var $musicList = $(".content_list ul");
        $.each(data, function(index, value){
          var $item = createMusicItem(index, value);
          $musicList.append($item);
        })
        // 1.2 初始化第一条歌曲信息
        initMusicInfo(data[0]);
        // 1.3 初始化第一首歌曲歌词信息
        initLyricInfo(data[0]);
      },
      error: function(){
        alert("请求不到数据...")
      }
    })
  }
  // 2. 初始化歌曲信息
  function initMusicInfo(music){
    //获取对应元素的jquery对象
    var $musicImage = $(".song_info_pic img");
    var $musicName = $(".song_info_name a");
    var $musicSinger = $(".song_info_singer a");
    var $musicAlbum = $(".song_info_album a");
    var $musicProgressName = $(".music_progress_name");
    var $musicProgressTime = $(".music_progress_time");
    var $musicBg = $(".mask_bg");
    //给获取到的元素赋值
    $musicImage.attr("src", music.cover);
    $musicName.text(music.name);
    $musicSinger.text(music.singer);
    $musicAlbum.text(music.album);
    $musicProgressName.text(music.name + " / " + music.singer);
    $musicProgressTime.text("00:00 / " + music.time);
    $musicBg.css("background", "url('" + music.cover +"')")
  }
  // 3. 初始化歌词信息
  function initLyricInfo(music){
    lyric = new Lyric(music.link_lrc);
    var $songLyric = $(".song_lyric");
    //清空上一首的歌词
    $songLyric.empty();
    lyric.loadLyric(function(){
      // 创建歌词列表
      $.each(lyric.lyrics, function(index, value){
        var $item = $("<li>" + value +"</li>")
        $songLyric.append($item);
      })
    })
  }
  // 4. 初始化进度条
  initProgress();
  function initProgress(){
    var $progressBar = $(".music_progress_bar");
    var $progressLine = $(".music_progress_line");
    var $progressDot = $(".music_progress_dot");
    musicProgress = Progress($progressBar, $progressLine, $progressDot);
    musicProgress.progressClick(function(ratio){
      player.musicSeekTo(ratio);
    });
    musicProgress.progressMove(function(ratio){
      player.musicSeekTo(ratio);
    });
    var $voiceBar = $(".music_voice_bar");
    var $voiceLine = $(".music_voice_line");
    var $voiceDot = $(".music_voice_dot");
    voiceProgress = Progress($voiceBar, $voiceLine, $voiceDot);
    voiceProgress.progressClick(function(ratio){
      player.musicVoiceSeekTo(ratio);
    });
    voiceProgress.progressMove(function(ratio){
      player.musicVoiceSeekTo(ratio);
    });
  }
  // 5. 初始化事件监听
  initEvents()
  function initEvents(){
    // 1.监听歌曲的移入移出事件(采用事件委托)
    $(".content_list").delegate(".list_music", "mouseenter", function(){
      //显示子菜单
      $(this).find(".list_menu").stop().fadeIn(100);
      //隐藏时长
      $(this).find(".list_time span").stop().fadeOut(100);
      $(this).find(".list_time a").stop().fadeIn(100);
    })
    $(".content_list").delegate(".list_music", "mouseleave", function(){
      //隐藏子菜单
      $(this).find(".list_menu").stop().fadeOut(100);
      //显示时长
      $(this).find(".list_time a").stop().fadeOut(100);
      $(this).find(".list_time span").stop().fadeIn(100);
    })
    // 2.监听复选框的点击事件(采用事件委托)
/*    $(".content_list").delegate(".list_check","click", function(){
      $(this).toggleClass("list_checked")
    })*/
    // 3.监听子菜单播放按钮
    var $musicPlay = $(".music_play");//获取底部播放按钮
    $(".content_list").delegate(".list_menu_play", "click", function(){
      // 3.1 切换播放图标
      $(this).toggleClass("list_menu_play2");
      // 3.2 复原其他播放图标
      $(this).parents(".list_music").siblings().find(".list_menu_play").removeClass("list_menu_play2")
      $(this).parents(".list_music").siblings().find("div").css("color","rgba(255,255,255,0.5)")
      // 3.3 同步底部播放按钮
      if($(this).hasClass("list_menu_play2")){
        //当前子菜单的播放按钮是播放状态
        $musicPlay.addClass("music_play2")
        //让整行文字高亮
        $(this).parents(".list_music").find("div").css("color","rgba(255,255,255,1)")
      }else{
        //当前子菜单的播放按钮不是播放状态
        $musicPlay.removeClass("music_play2")
        //让整行文字不高亮
        $(this).parents(".list_music").find("div").css("color","rgba(255,255,255,0.5)")
      }
      // 3.4 切换序号状态
      $(this).parents(".list_music").find(".list_number").toggleClass("list_number2");
      $(this).parents(".list_music").siblings().find(".list_number").removeClass("list_number2");
      // 3.5 播放音乐
      player.playMusic($(this).parents("li").get(0).index, $(this).parents("li").get(0).music);
      // 3.6 切换歌曲信息
      initMusicInfo($(this).parents("li").get(0).music);
      // 3.7 切换歌词信息
      initLyricInfo($(this).parents("li").get(0).music);
    })
    // 4. 监听底部控制区域播放按钮的点击
    $(".music_play").click(function(){
      //判断有没有播放过音乐
      if(player.currentIndex === -1) {
        //没有播放过音乐
        $(".list_music").eq(0).find(".list_menu_play").trigger("click");
      }else{
        //已经播放过音乐
        $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
      }
    })
    // 5. 监听底部控制区域上一首按钮的点击
    $(".music_pre").click(function(){
      $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
    })
    // 6. 监听底部控制区域下一首按钮的点击
    $(".music_next").click(function(){
      $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
    })
    // 7. 监听删除按钮的点击
    $(".content_list").delegate(".list_menu_del","click", function(){
      //找到被点击的音乐
      var $listMusic = $(this).parents(".list_music")
      //删除当前正在播放的音乐
      if($listMusic.get(0).index === player.currentIndex){
        $(".music_next").trigger("click")
      }
      $listMusic.remove();
      player.changeMusicList($listMusic.get(0).index)
      //重新排序
      $(".list_music").each(function(index, ele){
        ele.index = index;
        $(ele).find(".list_number").text(index + 1);
      })
      //如果音乐列表为空
      if($(".list_music").length === 0){
        $(".music_progress_name").text("");
        $(".music_progress_time").text("00:00 / 00:00");
        $(".song_lyric").empty();
        $(".song_info_name a").text("");
        $(".song_info_singer a").text("");
        $(".song_info_album a").text("");
        $(".song_info_pic img").attr("src", "./public/images/lnj.jpg")
      }
    })
    // 8. 监听播放的进度
    player.musicTimeUpdate(function(currentTime, duration,progressTime){
      //同步时间
      $(".music_progress_time").text(progressTime);
      //监听播放比例
      var ratio = currentTime / duration * 100;
      //同步进度条
      musicProgress.setProgress(ratio);
      // 实现歌词的同步
      var index = lyric.currentIndex(currentTime);
      var $item = $(".song_lyric li").eq(index);
      $item.addClass("cur");
      $item.siblings().removeClass("cur");
      //实现歌词滚动
      if(index < 2) return;
      $(".song_lyric").css("marginTop", (-index + 2) * 30);
      if(player.audio.ended){
        $(".music_next").trigger("click")
      }
    });
    // 9. 监听声音按钮的点击
    $(".music_voice_icon").click(function(){
      //图标的切换
      $(this).toggleClass("music_voice_icon2")
      //声音的切换
      if($(this).hasClass("music_voice_icon2")){
        //没有声音
        player.musicVoiceSeekTo(0);
      }else{
        //有声音
        player.musicVoiceSeekTo(1);
      }
    })
  }

  // 定义一个方法，创建一条音乐
  function createMusicItem(index, value){
    var $item = $("<li class=\"list_music\">\n" +
        // "            <div class=\"list_check\"><i></i></div>\n" +
        "            <div class=\"list_number\">"+ (index + 1) +"</div>\n" +
        "            <div class=\"list_name\">\n" +
        "              <div class=\"list_name_text\">"+ value.name +"</div>\n" +
        "              <div class=\"list_menu\">\n" +
        "                <a href=\"javascript:;\" title=\"播放\" class=\"list_menu_play\"></a>\n" +
        "                <a href=\"javascript:;\" title=\"添加\"></a>\n" +
        "                <a href=\"" + value.link_url + "\" download='"+ value.name +"' title=\"下载\"></a>\n" +
        "                <a href=\"javascript:;\" title=\"分享\"></a>\n" +
        "              </div>\n" +
        "            </div>\n" +
        "            <div class=\"list_singer\">"+ value.singer +"</div>\n" +
        "            <div class=\"list_time\">\n" +
        "              <span>"+ value.time +"</span>\n" +
        "              <a href=\"javascript:;\" title=\"删除\" class=\"list_menu_del\"></a>\n" +
        "            </div>\n" +
        "          </li>");
    $item.get(0).index = index;
    $item.get(0).music = value;
    return $item;
  }
})