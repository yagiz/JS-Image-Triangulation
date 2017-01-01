function BlackTracer(imageData)
{
	this.imageData = imageData;
	this.points = [];
	this.markedPoints = [];

	for(var x = 0; x<this.imageData.width; x++)
	{
		for(var y = 0; y<this.imageData.height; y++)
		{
			var p = {};
			p.x = x;
			p.y = y;
			p.isMarked = false;

			this.points.push(p);
		}
	}

	for(var i=0; i<this.points.length; i++)
	{

			var p = this.points[i];

			var x = p.x;
			var y = p.y;

			var top = {x:x,y:y-1};
			var left = {x:x-1,y:y};
			var right = {x:x+1,y:y};
			var bottom = {x:x,y:y+1};

			if(top.y>=0 && left.x>=0 && right.x<=this.imageData.width && bottom.y<=this.imageData.height)
			{
				var selfColor = getRGBAt(imageData,x,y);

				var topColor = getRGBAt(imageData,top.x,top.y);
				var leftColor = getRGBAt(imageData,left.x,left.y)
				var rightColor = getRGBAt(imageData,right.x,right.y);
				var bottomColor = getRGBAt(imageData,bottom.x,bottom.y);

				if(selfColor.r > 250 && selfColor.g >250 && selfColor.b >250 && p.isMarked == false)
				{

					var isTopBlack = topColor.r == 0 && topColor.g == 0 && topColor.b == 0;
					var isLeftBlack = leftColor.r == 0 && leftColor.g == 0 && leftColor.b == 0;
					var isRightBlack = rightColor.r == 0 && rightColor.g == 0 && rightColor.b == 0;
					var isBottomBlack = bottomColor.r == 0 && bottomColor.g == 0 && bottomColor.b == 0;

					if(isTopBlack || isLeftBlack || isRightBlack || isBottomBlack)
					{
						p.isMarked = true;
						this.markedPoints.push(p);
					}
				}
			}			
		}
}

function getAvarageRGBAt(imageData,x,y,width,height)
{
	var xl = width - x;
	var yl = height - y;

	var avarageColor = {r:0,g:0,b:0}
	var colorCount = 0;

	for(var ix=x; ix<x+width; ix++)
	{
		for(var iy=y; iy<y+height; iy++)
		{

			var color = getRGBAt(imageData,ix,iy);
			
			avarageColor.r += color.r;
			avarageColor.g += color.g;
			avarageColor.b += color.b;

			colorCount++;
		}
	}

	avarageColor = {r:Math.floor(avarageColor.r/colorCount),
					g:Math.floor(avarageColor.g/colorCount),
					b:Math.floor(avarageColor.b/colorCount)};

	return avarageColor;
}

function isRGBDifferent(imageData,x,y,width,height,distanceThreshold,countThreshold)
{

	var avarageColor = getAvarageRGBAt(imageData,x,y,width,height);
	var colorCount = 0;
	var differentColorCount = 0;

	var xl = width - x;
	var yl = height - y;

	// console.log("avarageColor ",avarageColor);

	for(var ix=x; ix<x+width; ix++)
	{
		for(var iy=y; iy<y+height; iy++)
		{
			var color = getRGBAt(imageData,ix,iy);

			var colorDistance = getColorDistance(color,avarageColor);

			// console.log(color,avarageColor,colorDistance);

			if(colorDistance>distanceThreshold)
			{
				differentColorCount++;
			}

			colorCount++;
		}
	}

	if(differentColorCount/colorCount > countThreshold)
	{
		return true;
	}

	return false;
}

function getColorDistance(color1,color2)
{
	var dr = Math.abs(color2.r-color1.r);
	var dg = Math.abs(color2.g-color1.g);
	var db = Math.abs(color2.b-color1.b);

	var td = dr + dg + db;
	var nd = td / (255+255+255);

	return nd;
}

function ImageDataLoader () 
{
	this.imageDatas = [];
	this.canvas = document.createElement('canvas');

	this.getImageDataWithURL = function(imageURL,completion)
	{

		if (this.imageDatas[imageURL])
		{
			completion(this.imageDatas[imageURL]); 
			return;
		}

		var img = new Image();
		var canvas = this.canvas;
		var context = this.context;
		var imageDatas = this.imageDatas;

		img.onload = function () 
		{
			var imageWidth = img.naturalWidth;
    		var imageHeigth = img.naturalHeight;

    		canvas.width = imageWidth;
			canvas.height = imageHeigth;

			context = canvas.getContext('2d');

			// console.log(canvas,imageWidth,imageHeigth);

			context.drawImage(img, 0, 0 );
			var imageData = context.getImageData(0, 0, imageWidth, imageHeigth);

			imageDatas[imageURL] = {image:img,data:imageData};
			completion(imageDatas[imageURL]);
		}

		img.src = imageURL;
	}
}

function getRGBAt(imageData,x,y)
{
	x = Math.floor(x);
	y = Math.floor(y);

	if(x<imageData.width && y<imageData.height)
	{
		var red = imageData.data[((imageData.width * y) + x) * 4];
	    var green = imageData.data[((imageData.width * y) + x) * 4 + 1];
	   	var blue = imageData.data[((imageData.width * y) + x) * 4 + 2];

		return {r:red,g:green,b:blue};
	}

	return null;
}
