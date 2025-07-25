interface CardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  note?: string;
}
const Card: React.FC<CardProps> = ({ icon: Icon, title, value, note }) => (
  <div className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ease-in-out">
    <div className="flex items-center">
      <div className="p-3 sm:p-4 bg-soft-gold rounded-xl flex-shrink-0 shadow-sm">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-rich-brown" />
      </div>
      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-serif font-semibold italic text-rich-brown truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-serif font-semibold text-rich-brown truncate">{value}</p>
        {note && <p className="text-xs font-serif font-light italic text-mocha/70 mt-1 line-clamp-2">{note}</p>}
      </div>
    </div>
  </div>

);


export default Card;
