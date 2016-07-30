define(function (require, exports, module) {

    var $ = require('jquery');

    $(function(){
        // 根据屏幕大小设置initial-scale
        var width = parseInt($(window).width());
        if(width > 640 && width < 900)
        {
            $("#vp").attr("content", "width=device-width, initial-scale=0.6, user-scalable=no, minimal-ui");   // iphone6以上
        }
        else if(width >= 900)
        {
            $("#vp").attr("content", "width=device-width, initial-scale=1, user-scalable=no, minimal-ui");    // ipad以上
        }    

        $(".artical-list .del").click(function(){
            var article_id = $(this).parent().attr("data-id");
            $.post("http://www.matengfei.net/dodel", { id: article_id },
                function(data){
                    $('.artical-list li[data-id="'+article_id+'"]').remove();
                }
            );
        });
    });
    
});
