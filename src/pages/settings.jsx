export default function settings() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="bg-liner-to-r from-blue-50 to-indigo-50 px-6 pt-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Yangi kompaniya qo‘shish
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Barcha maydonlarni to‘ldiring
              </p>
            </div>

            <form className="space-y-6 p-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Kompaniya nomi
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Masalan: TechNova Solutions"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="companyId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company ID
                </label>
                <input
                  id="companyId"
                  type="number"
                  placeholder="123456"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="icon"
                  className="block text-sm font-medium text-gray-700"
                >
                  Logotip / Icon
                </label>
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-32 w-full cursor-pointer flex-col rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-600">
                        Rasmni bu yerga yuklang yoki bosing
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, SVG (maks 2MB)
                      </p>
                    </div>
                    <input
                      id="icon"
                      type="file"
                      accept="image/*"
                      className="opacity-0"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="sActive"
                  type="checkbox"
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label
                    htmlFor="sActive"
                    className="cursor-pointer text-sm font-medium text-gray-700"
                  >
                    Faol holatda
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Ushbu kompaniya hozirda faol ishlayotgan bo‘lsa belgilang
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full transform rounded-lg bg-blue-600 px-4 py-3.5 font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700"
                >
                  Saqlash va qo‘shish
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Barcha ma’lumotlar xavfsiz saqlanadi • * majburiy maydonlar
          </p>
        </div>
      </div>
    </>
  );
}
