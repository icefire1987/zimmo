<?php
class image{	
	private $image=false;
	private $title;
	private $path;
	private $width;
	private $realwidth;
	private $height;
	private $ratio;
	
	function __construct($p_path,$p_title){
		if(file_exists($p_path)){
			$this->path=$p_path;
			$this->title=$p_title;
			return $this;
		}else{
			return false;
		}		
	}
	public function __get($property) {
    	if (property_exists($this, $property)) {
    		return $this->$property;
    	}
  	}
	
	public function __set($property, $value) {
		if (property_exists($this, $property)) {
			$this->$property = $value;
		}
	}
	function loadImage(){
		if(file_exists($this->path)){			
			return $this;
		}else{
			return false;
		}
	}
	function getimagesize(){
		return getimagesize($this->path);
	}
	function getStyleString(){
		
	}
	function setImageSize($iw) {
		if($this->path=="../"){return false;}
		if(isset($this->path) && file_exists($this->path)){	
				$is=$this->getimagesize();
	
				$this->width=$is[0];
				$this->height=$is[1];
				$this->ratio=($is[0]/$is[1]);

				if($this->width>$iw->width){
					$this->width = $iw->width;
					$this->height = $this->width/$this->ratio;
				}
				
				$this->realwidth=$this->ratio*$iw->height;
				if($this->realwidth>$iw->width){
					$this->realwidth = $iw->width;
				}
				
					
				return true;
		}
		return false;
	}
	function showImage($iw){
		if($this->ratio>$iw->ratio){
			$z=$iw->height - ( ($iw->width/$this->width)*$this->height );
			$style="width:".$iw->width."px;margin-top:".($z/2)."px;";
		}else{
			$style="height:".$iw->height."px";
		}
		return '<img style="'.$style.'" src="'.$this->path.'">';
	}
	function showTitle(){
		return '<span class="block imgTitle" style="margin:0 auto;width:'.$this->realwidth.'px">'.$this->title.'</span>';
	}
	
	
}