
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bullet-gray text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="font-rajdhani font-bold text-xl">
              <span className="text-bullet">BULLET</span> ECHO
              <span className="text-bullet ml-1">CHECKLIST</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.rights", { year: currentYear })}
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>{t("footer.disclaimer")}</p>
            <p>{t("footer.fanMade")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
