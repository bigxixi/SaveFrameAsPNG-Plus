# SaveFrameAsPNG-Plus
An Adobe After Effect script to save current frame as PNG file in two ways.</br>
AE当前帧存为png脚本，可以用来切图嗯。</br>
# How to Use
Download the [`ZIP file`](https://github.com/bigxixi/SaveFrameAsPNG-Plus/archive/master.zip) and unzip.</br>
Run AE, click `File`->`Script`->`Run Script File...` and choose the `SaveFrameAsPNG-Plus.jsx` file.  
</br>
Or you can copy the `SaveFrameAsPNG-Plus.jsx` to your AE script folder:
>**Windows:**  
>`C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Script`  
>**Mac:**  
>`/Applications/Adobe After Effects <version>/Scripts/`
</br>
Then you can run it derectly from `File`->`Script`  </br></br>
![](https://raw.githubusercontent.com/bigxixi/ReadMe-Resources/master/SaveFrameAsPNG-Plus/menu1.png)  
[see details](https://helpx.adobe.com/after-effects/using/scripts.html)

If everthing goes right, you will see this:</br>
![](https://raw.githubusercontent.com/bigxixi/ReadMe-Resources/master/SaveFrameAsPNG-Plus/screenshot1.png)</br>

# The differences between the two ways  
As you can see I set two buttons on the pannel, the `PNG with good Alpha` one is recomanded which renders in the regular way through the Render Queue. The other one `PNG with bad Alpha` uses an undocumented function `saveFrameToPng()` to generate images. It is a little faster and simpler than the regular one and results almost the same if your image has no transparence, but some black egdes  will be generated if you render the frame with alpha chanel.  
I keep them both because of research reason, you can see the details in the code.  
</br>
>**PNG with good Alpha**  
>>![](https://raw.githubusercontent.com/bigxixi/ReadMe-Resources/master/SaveFrameAsPNG-Plus/goodalpha1.png)  

>**PNG with bad Alpha**  
>>![](https://raw.githubusercontent.com/bigxixi/ReadMe-Resources/master/SaveFrameAsPNG-Plus/badalpha1.png)
</br>

# Known issues  
1. Only tested on Mac OS 10.11.5 with `AE CC 13.2` and One of my frends help test an early veision on Windows 10 with AE CC 2014, but I'm not sure if the latest one works on that.  
2. Sometimes the script might capture wrong images.Rerun the script to fiexd that.
3. If you open a new file in AE, you have to rerun the script.
