// Libreria di funzioni varie

function drawRotateImage(ctx, img, x, y, rotation){
	ctx.setTransform(1, 0, 0, 1, x, y);
	ctx.rotate(rotation * Math.PI / 180);
	ctx.drawImage(img, -img.width / 2, -img.height / 2);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}
