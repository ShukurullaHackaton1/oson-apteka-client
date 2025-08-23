import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "../../utils/helpers";

const SearchInput = ({
  placeholder = "Qidirish...",
  onSearch,
  className = "",
  debounceMs = 500,
}) => {
  const [value, setValue] = useState("");

  const debouncedSearch = debounce((searchValue) => {
    onSearch(searchValue);
  }, debounceMs);

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
