
export class BodyResponse {

	public status : Boolean;
	public body : any;
    
    constructor(status : Boolean , obj : any = {}){
		this.body = obj;
		this.status = status;
    }

}