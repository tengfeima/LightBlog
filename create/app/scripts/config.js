require.config({
  // make components more sensible
  // expose jquery
  paths: {
    "jquery": "http://mat1.gtimg.com/www/asset/lib/jquery/jquery-1.11.3.min",
    "template": "template"
  },

  shim: {
        'template': ['jquery']
    }
  
});

if (!window.requireTestMode) {
  require(['main']);
}





