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

        // 提交图片
        $(".a-upload").on("change","input[type='file']",function(){
            var filePath = $(this).val();
            if(filePath.indexOf("jpg") != -1 || filePath.indexOf("png") != -1){
                var arr = filePath.split('\\');
                var fileName = arr[arr.length-1];
                $(".showFileName").html(fileName);
            }else{
                $(".showFileName").html("您未上传文件，或者您上传文件类型有误！");
                return false 
            }
        });

        // 提交文章
        $(".done").click(function(){
            var formData = new FormData($('form')[0]);
            $.ajax({
                url: 'http://demo.qq.com:3000/uploadimg', 
                type: 'POST',
                // Form数据
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).always(function(){
                var title_html = $(".create .title").val();
                var content_html = $(".create .content").val();
                var img_name = $("#upload").val();
                $.post("http://demo.qq.com:3000/submit", { title: title_html, content: content_html, img: img_name},
                    function(data){
                        img_name = "";
                        console.log("done post", data);
                    }
                );
            });
        });
    });
    
});
