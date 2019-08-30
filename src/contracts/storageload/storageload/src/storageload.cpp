#include <eosio/eosio.hpp>
#include <vector>

using namespace eosio;

CONTRACT storageload : public contract {
  private:
      std::vector<double> data;
      
  public:
      using contract::contract;

      ACTION unique(long size, std::string unique) {
          data.clear();
          for (long i = 0; i < size; i++) {
            data.push_back(1.0 * i);
          }
          printf("Rewritten %d doubles, unique: %s", size, unique.c_str());
      }
      
      ACTION rewrite(long size) {
          data.clear();
          for (long i = 0; i < size; i++) {
            data.push_back(1.0 * i);
          }
          printf("Rewritten %d doubles", size);
      }
};