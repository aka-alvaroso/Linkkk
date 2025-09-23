import Button from '../components/Button/Button';
import { 
  FaArrowRight, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCopy, 
  FaSave,
  FaDownload,
  FaShare,
  FaStar
} from 'react-icons/fa';
import { 
  HiOutlineCheck, 
  HiOutlineCog 
} from 'react-icons/hi';

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 w-full">
      <h1 className="text-4xl font-black mb-8">Button Component Showcase</h1>
      
      <div className='flex gap-2'>
        <Button 
            variant="solid"
        >
            Solid
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      
      <div className='flex gap-2 w-full'>
        <Button variant="solid" size="xs">Solid</Button>
        <Button variant="outline" size="xs">Outline</Button>
        <Button variant="ghost" size="xs">Ghost</Button>
      </div>

      {/* Rounded Variants */}
      <div className='flex gap-2 w-full flex-wrap'>
        <Button variant="solid" size="sm" rounded="none" leftIcon={<FaArrowRight />}>None</Button>
        <Button variant="solid" size="sm" rounded="xs" leftIcon={<FaArrowRight />}>XS</Button>
        <Button variant="solid" size="sm" rounded="sm" leftIcon={<FaArrowRight />}>SM</Button>
        <Button variant="solid" size="sm" rounded="md" leftIcon={<FaArrowRight />}>MD</Button>
        <Button variant="solid" size="sm" rounded="lg" leftIcon={<FaPlus />}>LG</Button>
        <Button variant="solid" size="sm" rounded="xl" leftIcon={<FaTrash />}>XL</Button>
        <Button variant="solid" size="sm" rounded="full" leftIcon={<FaTrash />}>Full</Button>
      </div>

      {/* Icon Only Buttons */}
      <div className='flex gap-2'>
        <Button variant="solid" iconOnly size="sm"><FaPlus /></Button>
        <Button variant="outline" iconOnly size="sm"><FaEdit /></Button>
        <Button variant="ghost" iconOnly size="sm"><FaTrash /></Button>
        <Button variant="solid" iconOnly size="sm"><HiOutlineCheck /></Button>
        <Button variant="outline" iconOnly size="sm"><HiOutlineCog /></Button>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2 flex-wrap'>
        <Button variant="solid" leftIcon={<FaSave />}>Save</Button>
        <Button variant="outline" leftIcon={<FaCopy />}>Copy</Button>
        <Button variant="ghost" leftIcon={<FaShare />}>Share</Button>
        <Button variant="solid" rightIcon={<FaDownload />}>Download</Button>
        <Button variant="outline" rightIcon={<FaArrowRight />}>Continue</Button>
      </div>

      {/* Loading States */}
      <div className='flex gap-2'>
        <Button variant="solid" loading>Saving...</Button>
        <Button variant="outline" loading>Processing...</Button>
        <Button variant="ghost" loading>Loading...</Button>
      </div>

      {/* Different Sizes */}
      <div className='flex gap-2 items-center'>
        <Button variant="solid" size="xs" leftIcon={<FaStar />}>XS</Button>
        <Button variant="solid" size="sm" leftIcon={<FaStar />}>SM</Button>
        <Button variant="solid" size="md" leftIcon={<FaStar />}>MD</Button>
        <Button variant="solid" size="lg" leftIcon={<FaStar />}>LG</Button>
        <Button variant="solid" size="xl" leftIcon={<FaStar />}>XL</Button>
      </div>

      {/* Real Use Cases */}
      <div className='space-y-4'>
        <h2 className="text-2xl font-semibold">Real Use Cases</h2>
        
        {/* Link Actions */}
        <div className='flex gap-2'>
          <Button variant="solid" leftIcon={<FaPlus />}>Create Link</Button>
          <Button variant="outline" leftIcon={<FaEdit />}>Edit</Button>
          <Button variant="ghost" leftIcon={<FaCopy />}>Copy URL</Button>
          <Button variant="outline" iconOnly><HiOutlineCog /></Button>
        </div>

        {/* Form Actions */}
        <div className='flex gap-2'>
          <Button variant="solid" leftIcon={<FaSave />}>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}