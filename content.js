window.onload = function() 
{
	startRendering();
};

var c;
var ctx;
var _image;
var _imageData;
var imageURL = "assets/face.jpg";

var tracer;
var vertices = [];

var pixelateBaseRectCount = 12*12;
var baseRectCount = 5*5;
var allRects = [];
var allPoints = [];
var vertices = [];

function startRendering()
{
  c = document.getElementById("canvas");
  c.style.backgroundColor = 'rgba(158, 167, 184, 0.2)';
  ctx = c.getContext("2d");
  var imageLoader = new ImageDataLoader();
  imageLoader.getImageDataWithURL(imageURL,function(obj)
  {
    _image = obj.image
    _imageData = obj.data;

    c.width = _imageData.width;
    c.height = _imageData.height;

    console.log(c);

    ctx.drawImage(_image, 0, 0);
    pixelateImage();
    createBaseRects();
  });
}

function pixelateImage()
{
  var baseRectWidth = Math.floor(_imageData.width / pixelateBaseRectCount);
  var baseRectHeight = Math.floor(_imageData.height / pixelateBaseRectCount);

  for(var ix=0; ix<pixelateBaseRectCount; ix++)
  {
    for(var iy=0; iy<pixelateBaseRectCount; iy++)
    {
      var rect = {x:ix*baseRectWidth,y:iy*baseRectHeight,width:baseRectWidth,height:baseRectHeight};
      var rectColor = getAvarageRGBAt(_imageData,rect.x,rect.y,rect.width,rect.height);

      console.log(rectColor);
      fillRect(rect.x,rect.y,rect.width,rect.height,rectColor);
    }    
  }

  _imageData = ctx.getImageData(0, 0, _image.naturalWidth, _image.naturalHeight);
}

function createBaseRects()
{
  var baseRectWidth = _imageData.width / baseRectCount;
  var baseRectHeight = _imageData.height / baseRectCount;

  for(var ix=0; ix<baseRectCount; ix++)
  {
    for(var iy=0; iy<baseRectCount; iy++)
    {
      var rect = {x:ix*baseRectWidth,y:iy*baseRectHeight,width:baseRectWidth,height:baseRectHeight};
      checkAndDvideRect(_imageData,rect);
    }    
  }

  findAllVertices();
  drawTriangles();
}

function checkAndDvideRect(imageData,rect)
{
  //drawRect(rect.x,rect.y,rect.width,rect.height);
  allRects.push(rect);

  var p0 = {x:rect.x,y:rect.y};
  var p1 = {x:rect.x+rect.width,y:rect.y};
  var p2 = {x:rect.x,y:rect.y+rect.y};
  var p3 = {x:rect.x+rect.width,y:rect.y+rect.height};
  

  var shouldDvide = isRGBDifferent(imageData,rect.x,rect.y,rect.width,rect.height,0.1,0.15);

  if(shouldDvide)
  {
    var subRects = divide4Rect(rect);
    for(var i=0; i<subRects.length; i++)
    {
      checkAndDvideRect(imageData,subRects[i]);
    }
  }
}

function findAllVertices()
{
  for(var i=0; i<allRects.length; i++)
  {
    vertices.push(getRandomPointInRect(allRects[i]));
  }
  
  vertices.push([0,0]);
  vertices.push([_imageData.width,0]);
  vertices.push([0,_imageData.height]);
  vertices.push([_imageData.width,_imageData.height]);
  console.log(vertices);
}

function getRandomPointInRect(rect)
{
  
  var px = Math.random()*rect.width + rect.x;
  var py = Math.random()*rect.height + rect.y;

  return [px,py];
}



function divide4Rect(rect)
{
  var rect0 = {x:rect.x,y:rect.y,width:rect.width*0.5,height:rect.height*0.5}

  var rect1 = {x:rect.width*0.5+rect.x, y:rect.y, width:rect.width*0.5, height:rect.height*0.5}

  var rect2 = {x:rect.x, y:rect.height*0.5+rect.y ,width:rect.width*0.5,height:rect.height*0.5}
  
  var rect3 = {x:rect.width*0.5+rect.x, y:rect.height*0.5+rect.y,width:rect.width*0.5, height:rect.height*0.5}

  return [rect0,rect1,rect2,rect3];
}

function drawRect(x,y,width,height)
{
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,255,0.2)";
      ctx.rect(x,y,width,height);
      ctx.stroke();
}

function fillRect(x,y,width,height,color)
{
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
      ctx.rect(x,y,width,height);
      ctx.strokeStyle = "black";
      //ctx.stroke();
      ctx.fill();
}

function drawTriangles()
{
  var triangles = Delaunay.triangulate(vertices);

  for(i = triangles.length; i; ) 
  {
    --i; var p0 = {x:vertices[triangles[i]][0], y:vertices[triangles[i]][1]};
    --i; var p1 = {x:vertices[triangles[i]][0], y:vertices[triangles[i]][1]};
    --i; var p2 = {x:vertices[triangles[i]][0], y:vertices[triangles[i]][1]};

    var points = [p0,p1,p2];

    var pc = {x:(p0.x+p1.x+p2.x)/3,y:(p0.y+p1.y+p2.y)/3};
    var cc = getRGBAt(_imageData,pc.x,pc.y);

    var pc0 = getRGBAt(_imageData,p0.x,p0.y);
    var pc1 = getRGBAt(_imageData,p1.x,p1.y);



    console.log(pc,cc.r,cc.g,cc.b);

      ctx.beginPath();
      ctx.fillStyle = "rgba(" + cc.r + "," + cc.g + "," + cc.b + ",1)";
      ctx.moveTo(p0.x,p0.y);
      ctx.lineTo(p1.x,p1.y);
      ctx.lineTo(p2.x,p2.y);
      ctx.lineTo(p0.x,p0.y);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();
      ctx.closePath();



      // ctx.beginPath();
      // ctx.moveTo(p0.x,p0.y);
      // ctx.lineTo(p1.x,p1.y);
      // ctx.lineTo(p2.x,p2.y);
      // ctx.lineTo(p0.x,p0.y);
      
      // var lingrad =  ctx.createLinearGradient(p0.x,p0.y,pc.x,pc.y);  
      // lingrad.addColorStop(1, "rgba(" + cc.r + "," + cc.g + "," + cc.b + ",1)");
      // lingrad.addColorStop(0, "rgba(" + (cc.r-20) + "," + (cc.g-20) + "," + (cc.b-20) + ",0.5)");
      // ctx.fillStyle = lingrad; 
      // ctx.fill();

      ctx.closePath();
  }
}