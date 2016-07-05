<?php
require_once 'class.image.php';
class imageCreator{
	private $pagewidth;
	private $imageWrapper;
	public $image=false;
	function __construct($p_pagewidth){
		$this->pagewidth=$p_pagewidth;		
	}

	function setImageWrapper($p_height,$p_width=false){
		if($p_width==false){$p_width=$this->pagewidth;}
		$this->imageWrapper = new stdClass();
		$this->imageWrapper->width=$p_width;
		$this->imageWrapper->height=$p_height;
		$this->imageWrapper->ratio=$this->imageWrapper->width/$this->imageWrapper->height;
		return $this->imageWrapper;
	}
	function newImage($p_path,$title) {
		if(isset($this->image)){
			unset($this->image);
		}
		$this->image= new image($p_path,$title);
		if($this->image->path==NULL){
			return false;
		}
		return $this->image;
	}
	
	function setImageProp($prop,$val) {
		if($this->image==false){return false;}		
		$this->image->__set($prop,$val);		
	}
	public function __get($property) {
		if (property_exists($this, $property)) {
			return $this->$property;
		}
	}
	function getImage(){
		return $this->image;
	}

	function checkGallery($images){
		$image1=$images[0];
		if($image1==false){return false;}
		$image1->setImageSize($this->imageWrapper);
		$ret=array(
				"images"=>array($image1),
				"cols"=>array(100)
		);
	
		$image2=$images[1];
		if($image1 != false && $image2 != false){	
			$image2->setImageSize($this->imageWrapper);
			if( ( ($image1->__get("width")/$image1->__get("height")) + ($image2->__get("width"))/$image2->__get("height") ) < $this->imageWrapper->ratio ){
				$widthTD2 = ($image2->__get("width")*100)/($image1->__get("width")+$image2->__get("width"));
				$widthTD1 = ($image1->__get("width")*100)/($image1->__get("width")+$image2->__get("width"));
				$ret=array(
						"images"=>array($image1,$image2),
						"cols"=>array($widthTD1,$widthTD2)
				);
			}
		}
		return($ret);
	}
	
}