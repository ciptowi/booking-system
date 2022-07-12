export class ObjResponse {
  constructor(success, message, data, error) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
