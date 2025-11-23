import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function SharedForm({formControls, formData, setFormData, onSubmit, buttonText}) {

    function renderInputsByComponentType(getControlItem) {
        let element = null;
        const value = formData[getControlItem.name] || '';
        switch (getControlItem.componentType) {
            case 'input':
                element = (
                <Input
                    name={getControlItem.name}
                    type={getControlItem.type}
                    placeholder={getControlItem.placeholder}
                    id={getControlItem.name}
                    value={value}
                    onChange = {event => setFormData({
                        ...formData,
                        [getControlItem.name]: event.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                );
                break;
            case 'select':
                element = (
                <Select onValueChange={(value) => setFormData({...formData, [getControlItem.name]: value})} value={value} >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={getControlItem.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            getControlItem.options &&
                            getControlItem.options.length > 0 ? 
                            getControlItem.options.map(optionItem => <SelectItem key={optionItem.id} value={optionItem.value}>{optionItem.label}</SelectItem>) : null
                        }

                    </SelectContent>
                </Select>
                );
                break;

            case 'textarea':
                element = (
                <Textarea
                    name ={getControlItem.name}
                    placeholder={getControlItem.placeholder}
                    id={getControlItem.id}
                    value={value}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     onChange = {event => setFormData({
                        ...formData,
                        [getControlItem.name]: event.target.value
                    })}
                />
                );
                break;

            default:
                element = (
                    <Input
                        name={getControlItem.name}
                        type={getControlItem.type}
                        placeholder={getControlItem.placeholder}
                        id={getControlItem.name}
                        value={value}
                         onChange = {event => setFormData({
                        ...formData,
                        [getControlItem.name]: event.target.value
                    })}
                />
                );
                break;
        }
        return element;
    }   

  return (
    <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-3">
            {
                formControls.map(controlItem => <div className="grid w-full gap-1.5" key={controlItem.name}>
                    <Label className="mb-1"> {controlItem.label} </Label>
                    {
                        renderInputsByComponentType(controlItem)
                    }
                </div>)
            }

        </div>
        <Button type="submit" className="mt-2 w-full">{buttonText || "Submit"}</Button>
    </form>
  );
}

export default SharedForm;