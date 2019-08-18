var fs = require('fs')
var gm = require('gm');
var shell = require('shelljs');
var absolutePath='/home/pi/Downloads/bot-kameron/modules/memegen/';


		function wrap(text){
			/*
			Split text into strings no longer then 25 characters, without breaking words.
			Basicly wrap text to next lines so it fits on image
			*/
			var ar=text.split(" "); //make array out of text
			var collection=0; //starting char caount value
			var limit=25; //char limit
			var result=''; //resulting single line of text
			ar.forEach(function(item){
				collection+=item.length; //length of word add to current counter
				if(collection>limit){
					return; //break for each if we exceeded char limit
					}
				result+=item+" ";//if not exceeded, add current word to resulting text line
				});
				console.log(result);
				return result; //return the result
			}
		function addWrappedText(array,index,callback){
			/*
			since gm is async, this function is recursive
			adds each line of text located in array variable passed to it
			index is starting index it should begin adding text from array ( usually just 0 )
			callback is function passed from main thread and escapes to main thread with path to made image
			*/
			if(index>array.length-1){
				//if all lines are added, resize image to standard size
				gm(absolutePath+'conv'+(array.length).toString()+'.jpg')
				.resize(null, 400)
				.write(absolutePath+'conv-final.jpg', function (err) {
					  if (!err){
							//image modification is done
				     console.log('done all');
				     callback(absolutePath+'conv-final.jpg');
					  }else {
					    console.log(err);
					  }
				});
				//return breaking recursion
				return;
			}

			//append text to image
				gm(absolutePath+'conv'+index.toString()+'.jpg')
			    .fill('black')
			    .font("Helvetica.ttf", 100)
			    .drawText(0, (100*(index+1)), array[index], 'North')//uses simple formula to determine text position, 100 * index+1 each line needs 100px space between them
					.write(absolutePath+'conv'+(index+1).toString()+'.jpg', function (err) {
						  if (!err){
								//write this part of image, increment index and call recursivly this function to add next line
						     var t=index+1;
						     addWrappedText(array,t,callback);
						  }else {
						    console.log(err);
						  }
					});
					//end of function
	}
		exports.makememe = function(caption,image,url,callback){
			//clear existing parts and images
			shell.exec('rm '+absolutePath+'*.jpg');
			var string=caption;
			var an=[];//array of wrapped text lines
			while(string.length>0){
				//white caption string has any words left, do this loop
				var temp=wrap(string);//use wrap function on caption string to cut it at correct length
				an.push(temp.trim());//push line to array
				//delete this line from string so that next time we get next line extracted
				string=string.replace(temp,"");
				string=string.replace(temp.trim(),"");
				//do it untill everyting is pulled from string and no chars are left
				}

					//download image from message attachments
					shell.exec('cd '+absolutePath+';wget '+url, {async:false});
		      gm(absolutePath+image)
					.resize(null, 1200)
					.gravity('South')
					.extent(null, 1250+(an.length*100))//extend image with white background, 100px of bg for each line of text
					.write(absolutePath+'conv0.jpg', function (err) {
					  if (!err){
					     console.log('done extending');
							 //start adding text
					     addWrappedText(an,0,callback);
					  }else {
					    console.log(err);
					  }
					});



			}
